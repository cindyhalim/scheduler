const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const UPDATE_INTERVIEW = "UPDATE_INTERVIEW";

function updateObjectInArray(array, action) {
  return array.map((item, index) => {
    if (index !== action.index) {
      return item;
    }
    return {
      ...item,
      spots: action.item
    };
  });
}

function getDayID(days, id) {
  let dayID;
  for (let day of days) {
    if (day.appointments.includes(id)) {
      dayID = day.id;
    }
  }
  return dayID - 1;
}

function updateSpots(days, dayID, appointments) {
  let spots = 0;
  days[dayID].appointments.forEach(appointment => {
    if (!appointments[appointment].interview) {
      spots++;
    }
  });
  return spots;
}

const reducer = (state, action) => {
  switch (action.type) {
    case SET_DAY:
      return { ...state, day: action.value };
    case SET_APPLICATION_DATA:
      return {
        ...state,
        days: action.days,
        appointments: action.appointments,
        interviewers: action.interviewers
      };
    case SET_INTERVIEW:
      const appointment = {
        ...state.appointments[action.eventData.id],
        interview: action.eventData.interview
          ? { ...action.eventData.interview }
          : null
      };
      const appointments = {
        ...state.appointments,
        [action.eventData.id]: appointment
      };

      let dayID = getDayID(state.days, action.eventData.id);
      let newSpots = updateSpots(state.days, dayID, appointments);
      let days = updateObjectInArray(state.days, {
        index: dayID,
        item: newSpots
      });
      return { ...state, appointments, days };
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
};

export {
  SET_DAY,
  SET_APPLICATION_DATA,
  SET_INTERVIEW,
  UPDATE_INTERVIEW,
  reducer
};
