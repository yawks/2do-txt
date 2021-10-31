import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatDate, formatLocaleDate, parseDate } from "./date";
import {
  taskCompletedStyle,
  taskContextStyle,
  taskDisabledStyle,
  taskFieldStyle,
  taskPriorityStyle,
  taskProjectStyle,
  taskTagStyle,
} from "./task-styles";
import { Dictionary } from "./types";
import { generateId } from "./uuid";

export type Priority = "A" | "B" | "C" | "D" | string;

export interface Task {
  completed: boolean;
  projects: string[];
  contexts: string[];
  completionDate?: Date;
  creationDate?: Date;
  priority?: Priority;
  fields: Dictionary<string[]>;
  body: string;
  raw: string;
  _id: string;
  _order: number;
}

export interface TaskFormData {
  body: string;
  priority?: string;
  dueDate?: Date;
  creationDate?: Date;
  completionDate?: Date;
  _id?: string;
}

export function parseTask(text: string, order: number) {
  const line = text.trim();
  const tokens = line.split(/\s+/).map((s) => s.trim());

  const _id = generateId();

  let completed = false;
  if (tokens[0] === "x") {
    completed = true;
    tokens.shift();
  }

  let priority: string | null = null;
  let priorityMatches = tokens[0].match(/\(([A-Z])\)/);
  if (priorityMatches) {
    priority = priorityMatches[1];
    tokens.shift();
  }

  let completionDate: Date | undefined = undefined;
  if (completed && tokens.length > 1) {
    completionDate = parseDate(tokens[0]);
    if (completionDate) {
      tokens.shift();
    }
  }

  let creationDate = parseDate(tokens[0]);
  if (creationDate) {
    tokens.shift();
  }

  const body = tokens.join(" ");

  const task: Task = {
    completed,
    body,
    raw: line,
    _id,
    _order: order,
    ...parseTaskBody(body),
  };

  if (completionDate) {
    task.completionDate = completionDate;
  }
  if (priority) {
    task.priority = priority;
  }
  if (creationDate) {
    task.creationDate = creationDate;
  }

  return task;
}

export function parseTaskBody(
  body: string
): Pick<Task, "contexts" | "projects" | "fields"> {
  const tokens = body
    .trim()
    .split(/\s+/)
    .map((t) => t.trim());

  const contexts = spliceWhere(tokens, (s) => /^@[\S]+/.test(s))
    .map((t) => t.substr(1))
    .filter((t) => t.length > 0);

  const projects = spliceWhere(tokens, (s) => /^\+[\S]+/.test(s))
    .map((t) => t.substr(1))
    .filter((t) => t.length > 0);

  const fields: Dictionary<string[]> = {};
  spliceWhere(tokens, (s) => /[^:]+:[^/:][^:]*/.test(s)).forEach((s) => {
    const tuple = s.split(":");
    if (fields[tuple[0]]) {
      fields[tuple[0]] = [...fields[tuple[0]], tuple[1]];
    } else {
      fields[tuple[0]] = [tuple[1]];
    }
  });

  return {
    contexts,
    projects,
    fields,
  };
}

export function useFormatBody() {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  return (task: Task) => {
    const tokens = task.body
      .trim()
      .split(/\s+/)
      .map((t) => t.trim());

    const space = <>&nbsp;</>;

    let formattedTokens = tokens.map((token, index) => {
      if (/^@[\S]+/.test(token)) {
        return (
          <React.Fragment key={index}>
            <span className={clsx(taskContextStyle, taskTagStyle)}>
              {token}
            </span>
            {space}
          </React.Fragment>
        );
      } else if (/^\+[\S]+/.test(token)) {
        return (
          <React.Fragment key={index}>
            <span className={clsx(taskProjectStyle, taskTagStyle)}>
              {token}
            </span>
            {space}
          </React.Fragment>
        );
      } else if (/[^:]+:[^/:][^:]*/.test(token)) {
        const substrings = token.split(":");
        const key = t(substrings[0].toLowerCase());
        const keySuffix = key !== substrings[0] ? ": " : ":";
        const value = substrings[1];
        const date = parseDate(value);
        const displayKey = key + keySuffix;
        const displayValue = date ? formatLocaleDate(date, language) : value;
        const text = displayKey + displayValue;
        return (
          <React.Fragment key={index}>
            <span className={clsx(taskFieldStyle, taskTagStyle)}>{text}</span>
            {space}
          </React.Fragment>
        );
      } else {
        return `${token} `;
      }
    });

    if (task.priority) {
      const priorityElement = (
        <React.Fragment key={task._id}>
          <span className={clsx(taskTagStyle, taskPriorityStyle)}>
            {task.priority}
          </span>
          {space}
        </React.Fragment>
      );
      formattedTokens = [priorityElement, ...formattedTokens];
    }

    const completedClass = task.completed
      ? clsx(taskCompletedStyle, taskDisabledStyle)
      : "";

    return <span className={completedClass}>{formattedTokens}</span>;
  };
}

export function stringifyTask(task: Task) {
  const tokens = [];
  if (task.completed) {
    tokens.push("x");
  }
  if (task.priority) {
    tokens.push(`(${task.priority})`);
  }
  if (task.completionDate) {
    tokens.push(formatDate(task.completionDate));
  }
  if (task.creationDate) {
    tokens.push(formatDate(task.creationDate));
  }
  tokens.push(task.body);
  return tokens.join(" ");
}

function spliceWhere<T>(items: T[], predicate: (s: T) => boolean): T[] {
  const result: T[] = [];
  for (let index = 0; index < items.length; index++) {
    if (predicate(items[index])) {
      result.push(items[index]);
      items.splice(index, 1);
      index--;
    }
  }
  return result;
}
