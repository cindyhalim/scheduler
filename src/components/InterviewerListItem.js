import React from "react";

import "./InterviewerListItem.scss";

export default function InterviewerListItem(props) {
  const interviewerClass = `interviewers__item ${
    props.selected ? "interviewers__item--selected" : ""
  }`;

  return (
    <li className={interviewerClass} onClick={props.setInterviewer}>
      <img
        className="interviewers__item-image"
        src={props.avatar}
        alt={props.name}
      />
      {props.selected && props.name}
    </li>
  );
}
