import { useEffect, useReducer } from "react";
import axios from "axios";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const SET_DAYS = "SET_DAYS";
const UPDATE_INTERVIEW = "UPDATE_INTERVIEW";
const SET_REMAININGSPOTS = "SET_REMAININGSPOTS";

function reducer(state, action) {
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
      return {
        ...state,
        appointments: action.appointments
      };
    case SET_DAYS:
      return {
        ...state,
        days: action.days
      };
    case SET_REMAININGSPOTS:
      return {
        ...state,
        days: action.days
      };
    case UPDATE_INTERVIEW: {
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
      return { ...state, appointments: appointments };
    }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}

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
  return dayID;
}

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  console.log(state);
  const setDay = day => dispatch({ type: SET_DAY, value: day });
  // const setDays = days => setState(prev => ({ ...prev, days }));

  useEffect(() => {
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ])
      .then(all => {
        dispatch({
          type: SET_APPLICATION_DATA,
          days: all[0].data,
          appointments: all[1].data,
          interviewers: all[2].data
        });
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    const wss = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    wss.onopen = function(event) {
      wss.send("ping");
      wss.onmessage = function(event) {
        const eventData = JSON.parse(event.data);
        if (eventData.type === "SET_INTERVIEW") {
          console.log(eventData);
          dispatch({ type: UPDATE_INTERVIEW, eventData });
        }
      };
    };

    return () => {
      wss.close();
    };
  }, []);

  function bookInterview(id, interview) {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    if (!state.appointments[id].interview) {
      let dayID = getDayID(state.days, id);

      let days = updateObjectInArray(state.days, {
        index: dayID - 1,
        item: state.days[dayID - 1].spots - 1
      });

      dispatch({ type: SET_REMAININGSPOTS, days });
    }

    return axios
      .put(`/api/appointments/${id}`, { interview })
      .then(() => dispatch({ type: SET_INTERVIEW, appointments }));
  }

  function cancelInterview(id) {
    const appointment = {
      ...state.appointments[id],
      interview: null
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };
    let dayID = getDayID(state.days, id);

    let days = updateObjectInArray(state.days, {
      index: dayID - 1,
      item: state.days[dayID - 1].spots + 1
    });

    dispatch({ type: SET_REMAININGSPOTS, days });
    return axios
      .delete(`/api/appointments/${id}`)
      .then(() => dispatch({ type: SET_INTERVIEW, appointments }));
  }

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview
  };
}
