import React, { Component } from 'react'
import axios from "axios"
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

const APPOINTMENT_URL = 'http://localhost:8080/appointments'
const SLOT_URL = 'http://localhost:8080/retrieveSlots'
const DELETE_URL = 'http://localhost:8080/deleteAppointment/'

let mySlots = []

class MyAppointments extends Component {


    state = {
      appointments: [],
      slots: [],
      deleteMenu: false
    }

  componentDidMount() {
    mySlots = []
    this.fetchAppointments()
  }

  componentWillMount() {
    if(!this.props.isAuthenticated && !this.props.isAdmin){
      this.props.history.push('/')
    }
  }

  fetchAppointments = () => {

    mySlots = []
    axios.get(APPOINTMENT_URL)
    .then(res => {
      const appointments = res.data;
      this.setState({ appointments })
    })

    axios.get(SLOT_URL, {
    })
    .then(res => {
      const slots = res.data;
      this.filterSlots(slots)
    })
  }

  filterSlots = (slots) => {
    let user = this.props.user
    for(let i = 0; i < slots.length; i++){
      if(slots[i].userId && slots[i].userId === user._id){
        mySlots.push(slots[i])
      }
    }
    this.setState({slots: mySlots})
  }

  deleteAppointment = (data) => {

    let slotId = data.appointment.slots

    axios.put(`${DELETE_URL}${slotId}`)
    .then(res => {
      const response = res.data;
      mySlots = []
      this.fetchAppointments()
    })
  }

  // this.setState({ slots: slots })
    render() {
      console.log(this.state.slots)
      let slotItems = this.state.slots.sort(function(a, b){return a.slot_date - b.slot_time}).map((slot, index) => {

        let slot_time = null

        switch(slot.slot_time){
          case '0':
            slot_time = '9 am'
            break;
          case '.5':
            slot_time = '9:30 am'
            break;
          case '1':
            slot_time = '10 am'
            break;
          case '1.5':
            slot_time = '10:30 am'
            break;
          case '2':
            slot_time = '11 am'
            break;
          case '2.5':
            slot_time = '11:30 am'
            break;
          case '3':
            slot_time = '12 pm'
            break;
          case '3.5':
            slot_time = '12:30 pm'
            break;
          case '4':
            slot_time = '1 pm'
            break;
          case '4.5':
            slot_time = '1:30 pm'
            break;
          case '5':
            slot_time = '2 pm'
            break;
          case '5.5':
            slot_time = '2:30 pm'
            break;
          case '6':
            slot_time = '3 pm'
            break;
          case '6.5':
            slot_time = '3:30 pm'
            break;
          case '7':
            slot_time = '4 pm'
            break;
          case '7.5':
            slot_time = '4:30 pm'
            break;
          case '8':
            slot_time = '5 pm'
            break;
          case '8.5':
            slot_time = '5:30 pm'
            break;
          }

          let appointments = this.state.appointments.map((appointment, index) => {

            if(slot._id === appointment.slots){
              return <li key={index + 100}>
                <p>{appointment.name}</p>
                <p>{appointment.phone}</p>
                <p>{appointment.email}</p>
                <p>{appointment.address}</p>
                <button onClick={()=>this.deleteAppointment({appointment})}>Delete Appointment</button>
              </li>
              }
            })
            let li = <div key={index}>
              <h3>{slot.slot_date}</h3>
                  <p>{slot_time}</p>
                <ul>{appointments}</ul>
                </div>

                  return li
          })


      return (
          <div>
              <h2>My Appointments</h2>
              <ul>
              {slotItems}
              </ul>
          </div>
      );
    }
  }

const mapStateToProps = state => {
  return {
    user: state.user,
    isAuthenticated : state.isAuthenticated,
    isAdmin : state.isAdmin
  }
}

export default connect(mapStateToProps)(MyAppointments)
