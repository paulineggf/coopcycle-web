import React, { useState } from 'react'
import { connect } from 'react-redux'
import { RRule, rrulestr } from 'rrule'
import _ from 'lodash'
import Select from 'react-select'
import { Button, Checkbox, Radio, TimePicker } from 'antd'
import moment from 'moment'
import hash from 'object-hash'

import AddressAutosuggest from '../../components/AddressAutosuggest'
import TimeRange from '../../utils/TimeRange'
import { timePickerProps } from '../../utils/antd'
import { recurrenceTemplateToArray } from '../redux/utils'
import { saveRecurrenceRule, createTasksFromRecurrenceRule } from '../redux/actions'

const freqOptions = [
  { value: RRule.DAILY, label: 'Every day' },
  { value: RRule.WEEKLY, label: 'Every week' }
]

const locale = $('html').attr('lang')
const weekdays = TimeRange.weekdaysShort(locale)

const byDayOptions = weekdays.map(weekday => ({
  label: weekday.name,
  value: RRule[weekday.key.toUpperCase()].weekday,
}))

const TemplateItem = ({ item, setFieldValue, onClickRemove }) => {

  return (
    <li className="d-flex justify-content-between align-items-center mb-4">
      <span className="mr-2">
        <Radio.Group
          defaultValue={ item.type }
          size="medium"
          onChange={ (e) => setFieldValue(item, 'type', e.target.value) }>
          <Radio.Button value="PICKUP">
            <i className="fa fa-cube"></i>
          </Radio.Button>
          <Radio.Button value="DROPOFF">
            <i className="fa fa-arrow-down"></i>
          </Radio.Button>
        </Radio.Group>
      </span>
      <AddressAutosuggest
        address={ item.address }
        geohash={ '' }
        onAddressSelected={ (value, address) => {
          const cleanAddress = _.pick(address, ['@id', 'streetAddress'])
          setFieldValue(item, 'address', cleanAddress)
        }}
        containerProps={{ style: { marginBottom: 0, marginRight: '0.5rem' } }} />
      <span>
        <TimePicker
          { ...timePickerProps }
          placeholder="Heure"
          defaultValue={ moment(item.after, 'HH:mm') }
          onChange={ (value, text) => setFieldValue(item, 'after', text) } />
        <TimePicker
          { ...timePickerProps }
          placeholder="Heure"
          defaultValue={ moment(item.before, 'HH:mm') }
          onChange={ (value, text) => setFieldValue(item, 'before', text) } />
      </span>
      <a href="#" className="ml-2" onClick={ e => {
        e.preventDefault()
        onClickRemove(item)
        }}>
        <i className="fa fa-lg fa-times"></i>
      </a>
    </li>
  )
}

const TemplatePreview = ({ items }) => {

  const key = items.length > 0 ? 'hydra:Collection' : 'items'

  const template = {
    '@type': items.length > 0 ? 'hydra:Collection' : 'Task',
    [ key ]: items
  }

  return (
    <pre>{ JSON.stringify(template, null, 2) }</pre>
  )
}

const RecurrenceEditor = ({ recurrence, onChange }) => {

  const ruleObj = rrulestr(recurrence)
  const defaultValue = _.find(freqOptions, option => option.value === ruleObj.options.freq)

  return (
    <div>
      <div className="mb-4">
        <Select
          options={ freqOptions }
          defaultValue={ defaultValue }
          onChange={ option => onChange({ ...ruleObj.options, freq: option.value }) }
          />
      </div>
      <div>
        <Checkbox.Group
          options={ byDayOptions }
          defaultValue={ ruleObj.options.byweekday }
          onChange={ opts => onChange({ ...ruleObj.options, byweekday: opts }) } />
      </div>
    </div>
  )
}

const ModalContent = ({ recurrenceRule, saveRecurrenceRule, createTasksFromRecurrenceRule }) => {

  const initialItems = recurrenceTemplateToArray(recurrenceRule.template)

  const [ items, setItems ] = useState(initialItems)
  const [ recurrence, setRecurrence ] = useState(recurrenceRule.rule)

  const setFieldValue = (item, name, value) => {
    const index = items.indexOf(item)
    if (-1 !== index) {
      const newItems = items.slice(0)
      newItems.splice(index, 1, { ...item, [name]: value })
      setItems(newItems)
    }
  }

  const removeItem = (item) => {
    const index = items.indexOf(item)
    if (-1 !== index) {
      const newItems = items.slice(0)
      newItems.splice(index, 1)
      setItems(newItems)
    }
  }

  return (
    <div>
      <p>
        <span className="mr-2">{ rrulestr(recurrence).toText() }</span>
        <code>{ recurrence }</code>
      </p>
      <hr />
      <RecurrenceEditor
        recurrence={ recurrence }
        onChange={ (newOpts) => {
          const cleanOpts = _.pick(newOpts, ['freq', 'byweekday'])
          setRecurrence(RRule.optionsToString(cleanOpts))
        }} />
      <hr />
      {/*
      <TemplatePreview items={ items } />
      <hr />
      */}
      <ol className="list-unstyled">
      { items.map((item, index) => (
        <TemplateItem
          key={ `${index}-${hash(item)}` }
          item={ item }
          setFieldValue={ setFieldValue }
          onClickRemove={ item => removeItem(item) } />
      )) }
      </ol>
      <Button icon="plus" onClick={ () => {
        const newItems = items.slice(0)
        newItems.push({
          '@type': 'Task',
          type: 'DROPOFF',
          address: {
            streetAddress: ''
          },
          after: '00:00',
          before: '23:59',
        })
        setItems(newItems)
      } }>Add</Button>
      <hr />
      <div className="d-flex justify-content-between">
        <Button size="large" onClick={ () => {
          createTasksFromRecurrenceRule(recurrenceRule)
        }}>Create tasks</Button>
        <Button type="primary" size="large" onClick={ () => {
          const template = {
            '@type': 'hydra:Collection',
            'hydra:member': items
          }
          saveRecurrenceRule({
            ...recurrenceRule,
            rule: recurrence,
            template
          })
        }}>Save</Button>
      </div>
    </div>
  )
}

function mapStateToProps(state) {

  return {
    recurrenceRule: state.currentRecurrenceRule,
  }
}

function mapDispatchToProps(dispatch) {

  return {
    saveRecurrenceRule: (recurrenceRule) => dispatch(saveRecurrenceRule(recurrenceRule)),
    createTasksFromRecurrenceRule: (recurrenceRule) => dispatch(createTasksFromRecurrenceRule(recurrenceRule))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalContent)
