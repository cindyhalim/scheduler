import React from "react";

import "./styles.scss";
import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Form from "./Form";
import Status from "./Status";
import Confirm from "./Confirm";
import Error from "./Error";
import useVisualMode from "../../hooks/useVisualMode";

const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const SAVING = "SAVING";
const DELETE = "DELETE";
const CONFIRM = "CONFIRM";
const ERROR_SAVE = "ERROR_SAVE";
const ERROR_DELETE = "ERROR_DELETE";
const EDIT = "EDIT";

export default function Appointment(props) {
  const { mode, transition, back } = useVisualMode(
    props.interview ? SHOW : EMPTY
  );

  function save(name, interviewer) {
    const interview = {
      student: name,
      interviewer
    };

    transition(SAVING);
    props
      .bookInterview(props.id, interview)
      .then(() => transition(SHOW))
      .catch(error => transition(ERROR_SAVE, true));
  }

  function cancel() {
    transition(DELETE, true);
    props
      .cancelInterview(props.id)
      .then(() => transition(EMPTY))
      .catch(error => transition(ERROR_DELETE, true));
  }

  function confirm() {
    transition(CONFIRM);
  }

  function edit() {
    transition(EDIT);
  }

  function studentName() {
    let nameOfStudent;
    if (props.interview !== null) {
      nameOfStudent = props.interview.student;
    }
    return nameOfStudent;
  }
  function interviewerID() {
    let interviewerID;
    if (props.interview !== null) {
      interviewerID = props.interview.interviewer.id;
    }
    return interviewerID;
  }

  return (
    <article className="appointment">
      <Header time={props.time} />
      {mode === EMPTY && <Empty onAdd={() => transition(CREATE)} />}
      {mode === SHOW && (
        <Show
          student={props.interview.student}
          interviewer={props.interview.interviewer}
          onDelete={confirm}
          onEdit={edit}
        />
      )}
      {mode === CREATE && (
        <Form
          interviewers={props.interviewers}
          studentName={studentName()}
          interviewer={interviewerID()}
          onSave={save}
          onCancel={() => back()}
        />
      )}
      {mode === SAVING && <Status message="Saving" />}
      {mode === CONFIRM && (
        <Confirm
          message="Are you sure you want to delete?"
          onCancel={() => back()}
          onConfirm={cancel}
        />
      )}
      {mode === DELETE && <Status message="Deleting" />}
      {mode === EDIT && (
        <Form
          interviewers={props.interviewers}
          studentName={studentName()}
          onSave={save}
          onCancel={back}
          interviewer={interviewerID()}
        />
      )}
      {mode === ERROR_DELETE && (
        <Error message="Could not cancel appointment" onClose={() => back()} />
      )}
      {mode === ERROR_SAVE && (
        <Error message="Could not save appointment" onClose={() => back()} />
      )}
    </article>
  );
}
