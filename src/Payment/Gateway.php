<?php

namespace AppBundle\Payment;

use AppBundle\Message\RetrieveStripeFee;
use AppBundle\Service\MercadopagoManager;
use AppBundle\Service\StripeManager;
use Omnipay\Common\Message\ResponseInterface;
use Sylius\Component\Payment\Model\PaymentInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

class Gateway
{
    private $resolver;
    private $stripeManager;
    private $mercadopagoManager;
    private $messageBus;

    public function __construct(
        GatewayResolver $resolver,
        StripeManager $stripeManager,
        MercadopagoManager $mercadopagoManager,
        MessageBusInterface $messageBus)
    {
        $this->resolver = $resolver;
        $this->stripeManager = $stripeManager;
        $this->mercadopagoManager = $mercadopagoManager;
        $this->messageBus = $messageBus;
    }

    public function authorize(PaymentInterface $payment, array $context = []): ResponseInterface
    {
        switch ($this->resolver->resolve()) {
            case 'mercadopago':

                $payment->setStripeToken($context['token']);

                $p = $this->mercadopagoManager->authorize($payment);

                $payment->setCharge($p->id);

                return new MercadopagoResponse($p);
            case 'stripe':
            default:

                $paymentIntent = $payment->getPaymentIntent();

                if (null !== $paymentIntent) {

                    if (!$payment->isGiropay() && $paymentIntent !== $context['token']) {
                        throw new \Exception('Payment Intent mismatch');
                    }

                    if ($payment->requiresUseStripeSDK()) {
                        $this->stripeManager->confirmIntent($payment);
                    }

                    return new StripeResponse([]);
                }

                // Legacy

                $charge = $this->stripeManager->authorize($payment);
                $payment->setCharge($charge->id);

                return new StripeResponse($charge);
        }
    }

    public function capture(PaymentInterface $payment): ResponseInterface
    {
        switch ($this->resolver->resolve()) {
            case 'mercadopago':
                $this->mercadopagoManager->capture($payment);

                return new MercadopagoResponse([]);
            case 'stripe':
            default:

                $this->stripeManager->capture($payment);

                $this->messageBus->dispatch(
                    new RetrieveStripeFee($payment->getOrder()),
                    [ new DelayStamp(30000) ]
                );

                return new StripeResponse([]);
        }
    }
}
