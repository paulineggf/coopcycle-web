<?php

namespace AppBundle\Entity\Invoice;

use AppBundle\Entity\Invoice;

class FooterItem
{
    /** @var int */
    protected $id;

    /** @var Invoice */
    protected $invoice;

    /** @var string */
    protected $name;

    /** @var int */
    protected $total = 0;

    /** @var int */
    protected $position;

    public function __construct($name = null, $total = 0)
    {
        $this->name = $name;
        $this->total = $total;
    }

    public function getId(): int
    {
        return $this->id;
    }

    /**
     * @return mixed
     */
    public function getInvoice()
    {
        return $this->invoice;
    }

    /**
     * @param mixed $invoice
     *
     * @return self
     */
    public function setInvoice($invoice)
    {
        $this->invoice = $invoice;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param mixed $name
     *
     * @return self
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getTotal()
    {
        return $this->total;
    }

    /**
     * @param mixed $total
     *
     * @return self
     */
    public function setTotal($total)
    {
        $this->total = $total;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param mixed $position
     *
     * @return self
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }
}
