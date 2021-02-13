<?php

namespace AppBundle\Sylius\Payment;

trait EdenredTrait
{
    public function setEdenredAuthorizationId($authorizationId)
    {
        $this->details = array_merge($this->details, [
            'edenred_authorization_id' => $authorizationId
        ]);
    }

    public function getEdenredAuthorizationId()
    {
        if (isset($this->details['edenred_authorization_id'])) {

            return $this->details['edenred_authorization_id'];
        }
    }
}
