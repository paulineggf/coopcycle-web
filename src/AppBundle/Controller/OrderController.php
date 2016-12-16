<?php

namespace AppBundle\Controller;

use AppBundle\Utils\Cart;
use AppBundle\Entity\DeliveryAddress;
use AppBundle\Entity\Restaurant;
use AppBundle\Entity\Order;
use AppBundle\Entity\OrderItem;
use AppBundle\Entity\GeoCoordinates;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use League\Geotools\Geotools;
use League\Geotools\Coordinate\Coordinate;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;

class OrderController extends Controller
{
    use DoctrineTrait;

    private function getCart(Request $request)
    {
        return $request->getSession()->get('cart');
    }

    private function getAddresses()
    {
        return $this->getRepository('DeliveryAddress')->findBy(array('customer' => $this->getUser()));
    }

    private function decodeGeoHash(Request $request)
    {
        $geotools = new Geotools();

        $geohash = $request->getSession()->get('geohash');

        $decoded = $geotools->geohash()->decode($geohash);

        return array(
            $latitude = $decoded->getCoordinate()->getLatitude(),
            $longitude = $decoded->getCoordinate()->getLongitude(),
        );
    }

    private function createOrder(Request $request, DeliveryAddress $deliveryAddress)
    {
        $cart = $this->getCart($request);

        $productRepository = $this->getRepository('Product');
        $restaurantRepository = $this->getRepository('Restaurant');

        $restaurant = $restaurantRepository->find($cart->getRestaurantId());

        $order = new Order();
        $order->setRestaurant($restaurant);
        $order->setDeliveryAddress($deliveryAddress);

        foreach ($cart->getItems() as $item) {

            $product = $productRepository->find($item['id']);

            $orderItem = new OrderItem();
            $orderItem->setProduct($product);
            $orderItem->setQuantity($item['quantity']);

            $order->addOrderedItem($orderItem);
        }

        return $order;
    }

    /**
     * @Route("/order", name="order")
     * @Template()
     */
    public function indexAction(Request $request)
    {
        $deliveryAddress = new DeliveryAddress();

        $addressForm = $this->createFormBuilder($deliveryAddress)
            // ->add('name', TextType::class)
            ->add('streetAddress', TextType::class)
            ->add('postalCode', TextType::class)
            ->add('addressLocality', TextType::class)
            ->add('description', TextType::class, ['required' => false])
            ->add('latitude', HiddenType::class, ['mapped' => false, 'required' => true])
            ->add('longitude', HiddenType::class, ['mapped' => false, 'required' => true])
            ->getForm();

        if ($request->getSession()->has('geohash')) {
            list($latitude, $longitude) = $this->decodeGeoHash($request);
            $addressForm->get('latitude')->setData($latitude);
            $addressForm->get('longitude')->setData($longitude);
        }

        $addressForm->get('streetAddress')->setData($request->getSession()->get('address'));

        $addressForm->handleRequest($request);

        if ($addressForm->isSubmitted() && $addressForm->isValid()) {

            $deliveryAddress = $addressForm->getData();
            $latitude = $addressForm->get('latitude')->getData();
            $longitude = $addressForm->get('longitude')->getData();

            $deliveryAddress->setCustomer($this->getUser());
            $deliveryAddress->setGeo(new GeoCoordinates($latitude, $longitude));

            $this->getManager('DeliveryAddress')->persist($deliveryAddress);

        } elseif ($addressForm->isSubmitted() && !$addressForm->isValid()) {
            // TODO
        }

        if ($request->isMethod('POST')) {

            if ($request->request->has('deliveryAddress')) {
                $deliveryAddress = $this->getRepository('DeliveryAddress')->find($request->request->get('deliveryAddress'));
            }

            $order = $this->createOrder($request, $deliveryAddress);
            $this->getManager('Order')->persist($order);

            $this->getManager('DeliveryAddress')->flush();
            $this->getManager('Order')->flush();

            $request->getSession()->remove('cart');

            return $this->redirectToRoute('order_confirm', array('id' => $order->getId()));
        }

        return array(
            'address_form' => $addressForm->createView(),
            'addresses' => $this->getAddresses(),
            'cart' => $this->getCart($request),
        );
    }

    /**
     * @Route("/order/{id}/confirm/", name="order_confirm")
     * @Template()
     */
    public function confirmAction($id, Request $request)
    {
        $order = $this->getRepository('Order')->find($id);

        return array(
            'order' => $order,
        );
    }
}
