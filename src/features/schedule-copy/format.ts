export interface ScheduleEntry {
  code: string
  name: string
  instructors: string[]
  meetings: string[]
  ratings: string[]
}

export interface DisplayedSchedule {
  term?: string
  option?: string
  entries: ScheduleEntry[]
}

export function formatSchedule(
  schedule: DisplayedSchedule,
  format: "text" | "table"
): string {
  if (format === "table") {
    const cleanCell = (value: string) => value.replace(/[\t\r\n]+/g, " ").trim()
    return [
      "Course code\tCourse name\tInstructor\tMeeting times\tProfessor rating",
      ...schedule.entries.map((entry) =>
        [
          entry.code,
          entry.name,
          entry.instructors.join("；"),
          entry.meetings.join("；"),
          entry.ratings.join("；")
        ]
          .map(cleanCell)
          .join("\t")
      )
    ].join("\n")
  }
  const title = [schedule.term, schedule.option && `Option ${schedule.option}`]
    .filter(Boolean)
    .join(" — ")
  const entries = schedule.entries.map((entry) =>
    [
      `Course code: ${entry.code}`,
      `Course name: ${entry.name}`,
      `Instructor: ${entry.instructors.join("；")}`,
      "Meeting times:",
      ...entry.meetings.map((meeting) => `- ${meeting}`),
      `Professor rating: ${entry.ratings.join("；")}`
    ].join("\n")
  )
  return [title, ...entries].filter(Boolean).join("\n\n")
}
