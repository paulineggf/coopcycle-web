import React, { useState } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Draggable, Droppable } from "react-beautiful-dnd"
import { Popover } from 'antd'
import { useTranslation } from 'react-i18next'
import { rrulestr } from 'rrule'
import moment from 'moment'

import Task from './Task'
import TaskGroup from './TaskGroup'
import UnassignedTasksPopoverContent from './UnassignedTasksPopoverContent'
import { setTaskListGroupMode, openNewTaskModal, toggleSearch, setCurrentRecurrenceRule } from '../redux/actions'
import { selectGroups, selectStandaloneTasks, selectRecurringTasks, selectRecurringRules } from '../redux/selectors'

class StandaloneTasks extends React.Component {

  shouldComponentUpdate(nextProps) {
    if (nextProps.tasks === this.props.tasks
      && nextProps.offset === this.props.offset
      && nextProps.selectedTasksLength === this.props.selectedTasksLength) {
      return false
    }

    return true
  }

  render() {
    return _.map(this.props.tasks, (task, index) => {

      return (
        <Draggable key={ task['@id'] } draggableId={ task['@id'] } index={ (this.props.offset + index) }>
          {(provided, snapshot) => {

            return (
              <div
                ref={ provided.innerRef }
                { ...provided.draggableProps }
                { ...provided.dragHandleProps }
              >
                <Task task={ task } />
                { (snapshot.isDragging && this.props.selectedTasksLength > 1) && (
                  <div className="task-dragging-number">
                    <span>{ this.props.selectedTasksLength }</span>
                  </div>
                ) }
              </div>
            )
          }}
        </Draggable>
      )
    })
  }
}

const StandaloneTasksWithConnect = connect(
  (state) => ({
    selectedTasksLength: state.selectedTasks.length,
  })
)(StandaloneTasks)

const Buttons = connect(
  (state) => ({
    taskListGroupMode: state.taskListGroupMode,
  }),
  (dispatch) => ({
    setTaskListGroupMode: (mode) => dispatch(setTaskListGroupMode(mode)),
    openNewTaskModal: () => dispatch(openNewTaskModal()),
    toggleSearch: () => dispatch(toggleSearch()),
  })
)(({ taskListGroupMode, setTaskListGroupMode, openNewTaskModal, toggleSearch }) => {

  const [ visible, setVisible ] = useState(false)
  const { t } = useTranslation()

  return (
    <React.Fragment>
      <a href="#" className="mr-3" onClick={ e => {
        e.preventDefault()
        openNewTaskModal()
      }}>
        <i className="fa fa-plus"></i>
      </a>
      <a href="#" className="mr-3" onClick={ e => {
        e.preventDefault()
        toggleSearch()
      }}>
        <i className="fa fa-search"></i>
      </a>
      <Popover
        placement="leftTop"
        arrowPointAtCenter
        trigger="click"
        content={ <UnassignedTasksPopoverContent
          defaultValue={ taskListGroupMode }
          onChange={ mode => {
            setTaskListGroupMode(mode)
            setVisible(false)
          }} />
        }
        visible={ visible }
        onVisibleChange={ value => setVisible(value) }
      >
        <a href="#" onClick={ e => e.preventDefault() } title={ t('ADMIN_DASHBOARD_DISPLAY') }>
          <i className="fa fa-list"></i>
        </a>
      </Popover>
    </React.Fragment>
  )
})

class UnassignedTasks extends React.Component {

  renderGroup(group, tasks) {
    return (
      <TaskGroup key={ group.id } group={ group } tasks={ tasks } />
    )
  }

  render() {

    return (
      <div className="dashboard__panel">
        <h4 className="d-flex justify-content-between">
          <span>{ this.props.t('DASHBOARD_UNASSIGNED') }</span>
          <span>
            <Buttons />
          </span>
        </h4>
        <div className="dashboard__panel__scroll">
          { this.props.recurrenceRules.map((rrule, index) => {

            const ruleObj = rrulestr(rrule.rule, {
              dtstart: moment.utc(rrule.startDate).toDate(),
            })

            const length = rrule.template['@type'] === 'hydra:Collection' ? rrule.template['hydra:member'].length : 1

            return (
              <span className="list-group-item text-info" key={ `rrule-${index}` } onClick={ () => this.props.setCurrentRecurrenceRule(rrule) }>
                <i className="fa fa-clock-o mr-2"></i>
                <span>
                  <span className="font-weight-bold">{ rrule.orgName }</span>
                  <span className="mx-1">›</span>
                </span>
                <span>{ `${ruleObj.toText()} - ${moment.utc(rrule.startDate).format('HH:mm')}/${moment.utc(rrule.endDate).format('HH:mm')} (${length})` }</span>
              </span>
            )
          }) }
          <Droppable droppableId="unassigned">
            {(provided) => (
              <div className="list-group nomargin" ref={ provided.innerRef } { ...provided.droppableProps }>
                { _.map(this.props.groups, (group, index) => {
                  return (
                    <Draggable key={ `group-${group.id}` } draggableId={ `group:${group.id}` } index={ index }>
                      {(provided) => (
                        <div
                          ref={ provided.innerRef }
                          { ...provided.draggableProps }
                          { ...provided.dragHandleProps }
                        >
                          { this.renderGroup(group, group.tasks) }
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                <StandaloneTasksWithConnect
                  tasks={ this.props.standaloneTasks }
                  offset={ this.props.groups.length } />
                { provided.placeholder }
              </div>
            )}
          </Droppable>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {

  return {
    groups: selectGroups(state),
    standaloneTasks: selectStandaloneTasks(state),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrentRecurrenceRule: (recurrenceRule) => dispatch(setCurrentRecurrenceRule(recurrenceRule)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(UnassignedTasks))
