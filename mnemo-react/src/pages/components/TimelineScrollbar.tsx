import React from "react";
import styles from "./TimelineScrollbar.module.scss";

interface ParsedEntry {
  path: string;
  utctime: string;
}

const TimelineScrollbar = ({
  parsedEntries,
}: {
  parsedEntries: ParsedEntry[];
}) => {
  const filesByMonth = parsedEntries.reduce((acc, entry) => {
    if (!entry.utctime) return acc;

    const date = new Date(entry.utctime);
    const monthKey = date.toLocaleString("default", {
      year: "numeric",
      month: "short",
    });

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(entry.path);

    return acc;
  }, {} as Record<string, string[]>);

  const scrollToFile = (filePath: string) => {
    const normalizedPath = filePath.split(/[/\\]/).pop();
    const element = document.querySelector(
      `[data-file-path="${normalizedPath}"]`
    );

    if (element) {
      const elementTop = element.getBoundingClientRect().top;
      const timeline = document.querySelector("#timeline");

      if (timeline) {
        const timelineTop = timeline.getBoundingClientRect().top;
        const y = elementTop - timelineTop + timeline.scrollTop - 60;

        timeline.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }
    }
  };

  const totalFiles = Object.values(filesByMonth).reduce(
    (sum, files) => sum + files.length,
    0
  );
  let cumulativeFiles = 0;

  return (
    <div className={styles.scrollbar}>
      {Object.entries(filesByMonth).map(([month, files]) => {
        const position = (cumulativeFiles / totalFiles) * 100;
        cumulativeFiles += files.length;

        return (
          <button
            key={month}
            className={styles.monthMarker}
            style={{ top: `${position}%` }}
            onClick={() => scrollToFile(files[0])}
          >
            {month}
          </button>
        );
      })}
    </div>
  );
};

export default TimelineScrollbar;
