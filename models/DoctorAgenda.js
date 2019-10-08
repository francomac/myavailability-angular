'use strict';

let mongoose = require('mongoose');
let dateChecker = require('./../helpers/dateChecker');
const AGENT_AGENDA_COLLECTION = 'agentAgenda';

// Doctor's Agenda Schema
let DoctorAgendaSchema = mongoose.Schema({
  officeName: {
    type: String,
    required: true
  },
  agentId: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startHour: {
    type: String,
    required: true
  },
  stopHour: {
    type: String,
    required: true
  },
  hourRange: {
    type: Array,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  registrationDate: {
    type: String,
    required: true
  }
});

let DoctorAgendaModel = mongoose.model(AGENT_AGENDA_COLLECTION, DoctorAgendaSchema, AGENT_AGENDA_COLLECTION);
module.exports.DoctorAgendaModel = DoctorAgendaModel;

/**
 * creating a new Doctor Agenda Schedule Model obj with already validated req.body data
 * @param  {} dataAgenda
 * @param  {} callback
 */
module.exports.registerAgenda = (dataAgenda, callback) => {

  return new Promise((resolve, reject) => {
    dataAgenda.hourRange = dateChecker.generateSchedule(dataAgenda.startHour, dataAgenda.stopHour);
    // creating a new Patient Model obj with already validated req.body data
    let newDoctorAgenda = new DoctorAgendaModel(dataAgenda);

    newDoctorAgenda.save()
      .then(AgendaModel => {
        resolve(AgendaModel);
      }).catch(err => {
        reject(err);
      })
    }).catch(err => {
      return err;
    })

  };

/** Get Schedules associated to a Doctor ID on an specific day.
 * @param  {} data
 */
module.exports.CheckDayHourInClinics = (data) => {

  let agendaSchedule = dateChecker.generateSchedule(data.startHour, data.stopHour)

  return new Promise((resolve, reject) => {
    DoctorAgendaModel.find({
      agentId: data.agentId,
      day: data.day
    })
    .then((schedule, err) => {
      if (schedule) {
        // compares hours range against agenda in DB
        let matches =[];
        agendaSchedule.forEach(newSchedule => {
          schedule.forEach(timeScheduled => {
            if (timeScheduled.hourRange.includes(newSchedule)) {
              matches.push(newSchedule)
            }
          });
        });
        return resolve(matches);
      } else {
        return resolve(err);
      }
    }).catch(err => {
      return reject(err);
    })
  })
};

/**
 * get a doctor agenda by agentId, clinic name, and date.
 * @param  {} params
 */
module.exports.checkClinicAgendaByDate = (params) => {

  return new Promise((resolve, reject) => {
    let queryParams = {};

    if (params.agentId === '0') {
      queryParams = {
        date: params.date,
        officeName: params.officeName
      }
    } else {
      queryParams = {
        agentId: params.agentId,
        date: params.date,
        officeName: params.officeName
      }
    }

    DoctorAgendaModel.find(queryParams)
    .then((agenda, err) => {
      if (agenda !== null) {
        return resolve(agenda);
      } else {
        return resolve(err);
      }
    }).catch(err => {
      return reject(err);
    })
  })
};

/**
 * get a doctor agenda by date.
 * @param  {} params
 */
module.exports.checkAgendaByDate = (params) => {

  return new Promise((resolve, reject) => {
    DoctorAgendaModel.find({
      date: params.date
    })
    .then((agenda, err) => {
      if (agenda !== null) {
        return resolve(agenda);
      } else {
        return resolve(err);
      }
    }).catch(err => {
      return reject(err);
    })
  })
};

/**
 * Deletes Agenda document.
 * @param  {} activation
 */
module.exports.deleteAgenda = (params) => {
  let queryParams = {};
  if (params.officeName === 'undefined') {
    queryParams = {
      agentId: params.agentId,
      date: params.date
    }
  } else {
    queryParams = {
      agentId: params.agentId,
      date: params.date,
      officeName: params.officeName
    }
  }

  return new Promise((resolve, reject) => {
    DoctorAgendaModel.deleteMany(queryParams, (err) => {
      if (err) {
        return resolve(false);
      } else {
        return resolve(true);
      }
    }).catch(err => {
      return reject(err);
    });
  });
};
