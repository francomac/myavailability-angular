'use strict';

let express = require('express');
let moment = require('moment');
let router = express.Router();

const User = require('../models/User');
const DoctorAgenda = require('../models/DoctorAgenda');
const Log = require('../models/Log');

// Load Helper
const {
  ensureAuthenticated
} = require('../helpers/auth');

// Generic error handler used by all endpoints.
let errorHandler = (title, err) => {
  console.log('\n' + title + ' - ' + err);
}

/*  "/api/doctors/availability/register"
 *    POST: Creates a new Clinic model according to the input data from req.body.
 */
router.post('/availability/register', (req, res) => {

  try {
    // validating form data
    req.checkBody('agentId', 'User Id Register field is required').notEmpty();
    req.checkBody('day', 'Agenda Day field is required').notEmpty();
    req.checkBody('date', 'Agenda Date field is required').notEmpty();
    req.checkBody('startHour', 'Agenda Opening Hour field is required').notEmpty();
    req.checkBody('stopHour', 'Agenda Closing Hour is required').notEmpty();
    req.checkBody('recurrent', 'Recurrent field is required').isBoolean();
    req.checkBody('offtime', 'Off time field is required').isBoolean();
    req.checkBody('registrationDate', 'Registration Date field is required').notEmpty();

    // check erros
    let errors = req.validationErrors();

    if (errors) {
      let log_ThisError = async () => {
        return Log.createLog({
          personalId: req.body.agentId,
          action: 'CLINIC_REGISTER',
          registrationDate: moment().format('MM/DD/YYYY HH:mm'),
          error: errors.param + ' ' + errors.msg
        });
      }
      log_ThisError()
        .then((res, err) => {
          res.status(200);
        })
        .catch(err => {
          res.status(200).json(err.message);
        })

    } else {
      let clinicRegister = async () => {
        return User.getUserByUserID(req.body.agentId);
      }
      clinicRegister()
        .then((result, err) => {
          // if there is a registered doctor with this doctor id, register continues
          if (!result) {
            err = "No user with this Id: " + req.body.agentId;
            errorHandler('User.getUserByUserID: ', err);
            throw new Error(err);
          } else {
            req.body.color = (result.color) ? result.color : '#BDE4F4';
            return DoctorAgenda.CheckDayHourInClinics(req.body);
          }
        })

        .then((result, err) => {
          // if there is a NOT registered agenda with this schedule, register is completed
          if (Object.keys(result).length > 0) {
            err = "This day/hour is not available";
            errorHandler('DoctorAgenda.CheckDayHourInClinics: ', err);
            throw new Error(err);
          } else {
            return DoctorAgenda.registerAgenda(req.body)
          }
        })

        .then((result, err) => {
          // if agenda register was successful, full doctor agenda will be request
          if (!result || result.length === 0) {
            err = "Agenda was not modify";
            errorHandler('DoctorAgenda.registerAgenda: ', err);
            throw new Error(err);
          } else {
            return DoctorAgenda.checkClinicAgendaByDate(req.body)
          }
        })

        .then((agenda, err) => {
          if (!agenda || agenda.length === 0) {
            err = "There are not records on this day/hour";
            errorHandler('DoctorAgenda.checkClinicAgendaByDate: ', err);
            throw new Error(err);
          } else {
            res.status(200).json(agenda);
          }
        })

        .catch(err => {
          let log_ThisError = async () => {
            return Log.createLog({
              personalId: req.body.agentId,
              action: 'AGENDA_REGISTER',
              registrationDate: moment().format('MM/DD/YYYY HH:mm'),
              error: err.msg
            });
          }
          log_ThisError()
            .then(() => {
            })
            .catch(err => {
            })
          res.status(200).json(err.message);
        });

    }
  } catch (error) {
    console.log(error);
  }
});

/*  "/api/doctors/availability/:agentId/:officeName/:date"
 *    GET: Gets Clinic Agenda for an specific date.
 */
router.get('/availability/:agentId/:officeName/:date', (req, res) => {
  DoctorAgenda.checkClinicAgendaByDate(req.params)
    .then((agenda, err) => {
      if (!agenda || agenda.length === 0) {
        err = "Day is fully available.";
        errorHandler('DoctorAgenda.checkClinicAgendaByDate: ', err);
        throw new Error(err);
      } else {
        res.status(200).json(agenda);
      }
    })
    .catch(err => {
      let log_ThisError = async () => {
        return Log.createLog({
          personalId: req.body.agentId,
          action: 'AGENDA_GET',
          registrationDate: moment().format('MM/DD/YYYY HH:mm'),
          error: err.msg
        });
      }
      log_ThisError()
        .then(() => {
        })
        .catch(err => {
        })
      res.status(200).json(err.message);

    });

});

/*  "/api/doctors/availability/delete/:agentId/:officeName/:date"
 *    DELETE: Deletes a agenda according to name
 */
router.delete('/availability/delete/:agentId/:officeName/:date', (req, res) => {
  DoctorAgenda.checkAgendaByDate(req.params)
  .then((clinic, err) => {
      if (!clinic) {
        err = "NO hay una agenda para esta fécha: " + req.params.date;
          errorHandler('DoctorAgenda.checkAgendaByDate: ', err);
          throw new Error(err);
      } else {
        return User.getUserByUserID(req.params.agentId);
      }
    })

    .then((result, err) => {
      // if there is a registered doctor with this doctor id, register continues
      if (!result) {
        err = "No hay un doctor registrado con este Id: " + req.params.doctorUr;
        errorHandler('User.getUserByUserID: ', err);
        throw new Error(err);
      } else {
         return DoctorAgenda.deleteAgenda(req.params)
      }
    })

    .then((clinic, err) => {
      if (!clinic) {
        err = "Agenda was not modified.";
        errorHandler('DoctorAgenda.deleteAgenda: ', err);
        throw new Error(err);
      } else {
        res.status(200).json({ clinic: req.params.officeName });
      }
    })
    .catch(err => {

      let log_ThisError = async () => {
        return Log.createLog({
          personalId: req.params.agentId,
          action: 'CLINIC_DELETE',
          registrationDate: moment().format('MM/DD/YYYY HH:mm'),
          error: err.msg
        });
      }
      log_ThisError()
        .then(() => {
        })
        .catch(err => {
        })
      res.status(200).json(err.message);

    });

});


module.exports = router;
