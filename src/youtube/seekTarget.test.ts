import { describe, expect, it } from "vitest";
import { seekTargetFrom } from "./seekTarget.js";

const ID = "5d6y3poKwK4";

describe("seekTargetFrom", () => {
  it("reads the second out of a chapter link into the open video", () => {
    expect(seekTargetFrom(`https://www.youtube.com/watch?v=${ID}&t=1517s`, ID)).toBe(1517);
    expect(seekTargetFrom(`https://youtu.be/${ID}?t=629`, ID)).toBe(629);
  });

  it("leaves a link to a different video alone", () => {
    expect(seekTargetFrom("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s", ID)).toBeUndefined();
  });

  it("leaves a link with no usable time alone", () => {
    expect(seekTargetFrom(`https://www.youtube.com/watch?v=${ID}`, ID)).toBeUndefined();
    expect(seekTargetFrom(`https://www.youtube.com/watch?v=${ID}&t=1m30s`, ID)).toBeUndefined();
    expect(seekTargetFrom("not a url", ID)).toBeUndefined();
  });
});
