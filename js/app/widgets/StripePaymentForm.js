import React, { useState } from 'react'
import { render } from 'react-dom'
import _ from 'lodash'
import classNames from 'classnames'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

import mastercard from 'payment-icons/min/flat/mastercard.svg'
import visa from 'payment-icons/min/flat/visa.svg'
import giropay from '../../../assets/svg/giropay.svg'
import edenredLogo from '../../../assets/svg/Edenred_Logo.svg'

import stripe from '../payment/stripe'
import mercadopago from '../payment/mercadopago'

function disableBtn(btn) {
  btn.setAttribute('disabled', '')
  btn.disabled = true
}

function enableBtn(btn) {
  btn.disabled = false
  btn.removeAttribute('disabled')
}

const methodPickerStyles = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const methodPickerBtnClassNames = {
  'btn': true,
  'btn-default': true,
  'p-2': true
}

const PaymentMethodPicker = ({ methods, onSelect }) => {

  const [ method, setMethod ] = useState('')
  const [ t ] = useTranslation()

  return (
    <div style={ methodPickerStyles }>
      <button type="button" className={ classNames({ ...methodPickerBtnClassNames, active: method === 'card' }) }
        onClick={ () => { setMethod('card'); onSelect('card') } }>
        <img src={ visa } height="45" className="mr-2" />
        <img src={ mastercard } height="45" />
      </button>
      { _.map(methods, m => {

        if (m.type === 'giropay') {

          return (
            <button key={ m.type } type="button" className={ classNames({ ...methodPickerBtnClassNames, active: method === 'giropay' }) }
              onClick={ () => { setMethod('giropay'); onSelect('giropay') } }>
              <img src={ giropay } height="45" />
            </button>
          )
        }

        if (m.type === 'edenred' || m.type === 'edenred+card') {

          return (
            <button key={ m.type } type="button" className={ classNames({ ...methodPickerBtnClassNames, active: method === m.type }) }
              onClick={ () => {

                if (!m.data.edenredIsConnected) {
                  window.location.href = m.data.edenredAuthorizeUrl
                  return
                }

                setMethod(m.type)

                axios.get('/order/payment/split')
                  .then((response) => {
                    document.getElementById('payment-redirect-help').querySelector('span').textContent = t('EDENRED_SPLIT_AMOUNTS', {
                      edenred: (response.data.edenred / 100).formatMoney(),
                      stripe: (response.data.stripe / 100).formatMoney(),
                    })
                    onSelect(m.type)
                  })

              }}>
              <img src={ edenredLogo } height="45" />
            </button>
          )
        }

      }) }
    </div>
  )
}

class CreditCard {
 constructor(config) {
   this.config = config;
 }
}

export default function(form, options) {

  const submitButton = form.querySelector('input[type="submit"],button[type="submit"]')

  const toggleButton = isValidForm => isValidForm ? enableBtn(submitButton) : disableBtn(submitButton)

  const methods = Array
    .from(form.querySelectorAll('input[name="checkout_payment[method]"]'))
    .map((el) => ({
      type: el.value,
      data: el.dataset
    }))

  disableBtn(submitButton)

  const gatewayForCard = options.card || 'stripe'
  const gatewayConfig = options.gatewayConfigs ? options.gatewayConfigs[gatewayForCard] : { publishableKey: options.publishableKey }

  switch (gatewayForCard) {
    case 'mercadopago':
      Object.assign(CreditCard.prototype, mercadopago({ onChange: toggleButton }))
      break
    case 'stripe':
    default:
      Object.assign(CreditCard.prototype, stripe)
  }

  const cc = new CreditCard({
    gatewayConfig,
    amount: options.amount,
    onChange: (event) => {
      if (event.error) {
        document.getElementById('card-errors').textContent = event.error.message
      } else {
        event.complete && enableBtn(submitButton)
        document.getElementById('card-errors').textContent = ''
      }
    },
    cardholderNameElement: options.cardholderNameElement,
  })

  cc.init(form)

  form.addEventListener('submit', function(event) {

    event.preventDefault()

    $('.btn-payment').addClass('btn-payment__loading')
    disableBtn(submitButton)

    if (methods.length > 1 && form.querySelector('input[name="checkout_payment[method]"]:checked').value === 'giropay') {

      cc.confirmGiropayPayment()
        .catch(e => {
          $('.btn-payment').removeClass('btn-payment__loading')
          enableBtn(submitButton)
          document.getElementById('card-errors').textContent = e.message
        })

      return
    }

    cc.createToken()
      .then(token => {
        options.tokenElement.setAttribute('value', token)
        form.submit()
      })
      .catch(e => {
        $('.btn-payment').removeClass('btn-payment__loading')
        enableBtn(submitButton)
        document.getElementById('card-errors').textContent = e.message
      })
  })

  const onSelect = value => {
    form.querySelector(`input[name="checkout_payment[method]"][value="${value}"]`).checked = true

    switch (value) {

      case 'card':
        cc.mount(document.getElementById('card-element')).then(() => enableBtn(submitButton))
        document.getElementById('payment-redirect-help').classList.add('hidden')
        break
      case 'edenred':
      case 'edenred+card':
        cc.mount(document.getElementById('card-element')).then(() => enableBtn(submitButton))
        document.getElementById('payment-redirect-help').classList.remove('hidden')
        break
      default:
        cc.unmount()
        document.getElementById('card-errors').textContent = ''
        document.getElementById('payment-redirect-help').classList.remove('hidden')
        enableBtn(submitButton)
    }
  }

  if (methods.length > 1) {

    // Replace radio buttons

    document
      .querySelectorAll('#checkout_payment_method .radio')
      .forEach(el => el.classList.add('hidden'))

    const el = document.createElement('div')
    document.querySelector('#checkout_payment_method').appendChild(el)

    render(
      <PaymentMethodPicker methods={ methods } onSelect={ onSelect } />,
      el
    )

  } else {
    cc.mount(document.getElementById('card-element')).then(() => enableBtn(submitButton))
  }
}
