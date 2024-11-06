export function formatStringToNumber(input: string) {
  input = input.replace("$", "").replace(/,/g, "");
  return Number.parseFloat(input);
}

export function formatStringToNumberNoNull(input: string) {
  if (input === "") {
    return 0;
  } else if (typeof input !== "string") {
    return input;
  } else {
    input = input.replace("$", "").replace(/,/g, "");
    return Number.parseFloat(input);
  }
}

export const parseDateRangeString = (
  dateRange: string
): { startDate: string; endDate: string } => {
  const dates = dateRange.split("-");
  if (dates[0] && dates[1]) {
    const startDateParse = dates[0].replace(" ", "").split("/");
    const inputStartDate = `${startDateParse[2]}-${startDateParse[0]}-${startDateParse[1]}`;
    const endDateParse = dates[1].replace(" ", "").split("/");
    const inputEndDate = `${endDateParse[2]}-${endDateParse[0]}-${endDateParse[1]}`;
    return {
      startDate: inputStartDate,
      endDate: inputEndDate,
    };
  } else {
    return { startDate: "", endDate: "" };
  }
};

export const getSubmitButtonDisabled = (
  isLoading: boolean,
  startDate: string,
  endDate: string,
  formUnsubmittable: boolean
) => {
  return isLoading || !(startDate && endDate) || formUnsubmittable;
};

export const toTitleCase = (text: string): string => {
  if (typeof text !== "string") {
    return "";
  }

  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
  );
};

/**
 * chunks any iterable, returns a generator
 * @param arr
 * @param size
 * @returns a generator of chunks
 * @example chunk([1, 2, 3], 2) -> [[1, 2], 3]
 */
export const chunk = function* <T>(arr: Iterable<T>, size = 1) {
  let chunk = [] as T[];
  for (const v of arr) {
    chunk.push(v);
    if (chunk.length === size) {
      yield chunk;
      chunk = [];
    }
  }
  if (chunk.length > 0) {
    yield chunk;
  }
};

/**
 * takes first x elements of an iterable
 * @param arr
 * @param size
 * @returns x elements from arr
 * @example take([1, 2, 3], 2) -> [1, 2]
 */
export const take = function <T>(arr: Iterable<T>, size = 1) {
  const chunks = chunk(arr, size);
  return chunks.next().value;
};

/**
 * Transforms a map into a standard JS object
 * @param map
 * @returns object
 * @example getObjectFromMap(new Map(['a', 1])) -> {a: 1}
 */
export const getObjectFromMap = <T, K>(map: Map<string, T>) => {
  const newData = {} as {
    [id: string]: T;
  };
  for (const [key, value] of map) {
    newData[key] = value;
  }
  return newData;
};

/**
 * Sleeps the current execution by a delay time
 * @param delay in ms
 * @example await sleep(1000)
 */
export const sleep = (delay: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
};

/**
 * generate a unique number given a string
 * @param str, input string
 * @example hashString('example') -> 1591818012
 */
export const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += Math.pow(str.charCodeAt(i) * 31, str.length - i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

/**
 * gets from an object even if it is undefined
 * @param record, the object
 * @param accessor, input string
 * @example get({a: 1}, 'a') -> 1
 */
const get = <T>(record?: Record<string, T>, accessor = "") =>
  record?.[accessor];

/**
 * gets from an object even if it is undefined
 * @param row, the object
 */
export const getRowNodeId = (row: { id: string }) => get(row, "id") ?? "";

/**
 * checks the primative is an object and not null
 * @param obj, the object
 */
const isObject = <T>(obj: T) => typeof obj === "object" && obj != null;

/**
 * checks if two objects are the same by value
 * @param obj1
 * @param obj2
 */
export const deepEquals = (
  obj1?: Record<string, any>,
  obj2?: Record<string, any>
) => {
  if (obj1 === undefined || obj2 === undefined) {
    return false;
  }
  if (obj1 === obj2) {
    return true;
  }
  if ([obj1, obj2].every(isObject)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (const prop in obj1) {
      if (!deepEquals(obj1[prop], obj2[prop])) {
        return false;
      }
    }
    return true;
  }
  return false;
};

/**
 * gets you the aggregate id from the path params
 * @param pathParams
 */
export const parsePathParams = (pathParams: Record<string, string>) =>
  pathParams["aggregateId"] ?? "";

/**
 * replaces in the array based on a predicate
 * @param arr array returned
 * @param toReplace list of items to replace
 * @param predicate test to find the item
 * @param append if not found, add to the end
 */
export const replaceOrAdd = <T>(
  arr: T[],
  toReplace: T[],
  predicate: (i: T) => (i: T) => boolean,
  append = true
) => {
  const result = [] as T[];
  for (const item of arr) {
    const index = toReplace.findIndex(predicate(item));
    if (index === -1) {
      result.push(item);
    } else {
      result.push(toReplace[index]);
      toReplace.splice(index, 1);
    }
  }
  return [...result, ...(append ? toReplace : [])];
};

/**
 * groups an array into a map of lists by a predicate
 * @param list array to group
 * @param predicate test to find the item
 * @example groupBy([1, 1, 2]) -> { "1": [ 1, 1 ], "2": [ 2 ] }
 */
export const groupBy = <T>(
  list: T[],
  predicate: (i: T) => string = (i: T) => `${i}`
) => {
  return list.reduce((curr, i) => {
    const key = predicate(i);
    const grouping = curr[key] ?? [];
    return { ...curr, [key]: [...grouping, i] };
  }, {} as { [k: string]: T[] });
};

/**
 * filters an array to only have unique items as determined by the predicate function
 * @param list array to filter
 * @param predicate function that groups items
 * @example uniqueBy([1, 1, 1, 2]) -> [1, 2]
 */
export const uniqueBy = <T, T1>(
  arr: T[],
  predicate: (i: T) => T1 = (i: T) => i as unknown as T1
) => {
  const seen = new Set<T1>();
  return arr.filter((i) => {
    const val = predicate(i);
    if (!seen.has(val)) {
      seen.add(val);
      return true;
    }
    return false;
  });
};

/**
 * flattens an array by 1 level
 * @param list array to flatten
 * @example flatten([[1], 2]) -> [1, 2]
 */
export const flatten = (arr: any[]): unknown =>
  arr.reduce((a, b) => a.concat(b), []);

/**
 * downloads a given url in the browser
 * @param url to be downloaded
 * @example downloadUrl('https://example.com/file.pdf')
 */
export const downloadUrl = (url: string = "", filename: string = "") => {
  if (!url || !document) {
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  if (filename !== "") {
    link.download = filename;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * formats a JS date object as MM/DD/YYYY
 * @param date
 * @returns formatted string
 */
export const formatDay = (date: Date, separator = "/") =>
  dateIsValid(date)
    ? new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
        .format(date)
        .replace(/\//g, separator)
    : "";

/**
 * formats a JS date object as MM/DD/YYYY HH:MM:SS
 * @param date
 * @returns formatted string
 */
export const formatDateTime = (date: Date) =>
  // typing as any because typescript doesnt accept dateStyle
  dateIsValid(date)
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "short",
        timeStyle: "long",
      } as any).format(date)
    : "";

/**
 * formats a list of JS date objects as  MM/DD/YYYY -  MM/DD/YYYY
 * @param dates
 * @returns formatted string
 */
export const formatDayRange = (dates: Date[]) =>
  dates.map((date) => formatDay(date)).join(" - ");

/**
 * returns if a date object is valid or not
 * @param date
 * @returns boolean
 */
export const dateIsValid = (date: Date) =>
  !Number.isNaN(new Date(date).getTime());

/**
 * returns a string of the date in YYYY/MM/DD
 * @param date
 * @returns formatted string
 */
export const getIsoDay = (date: Date) =>
  dateIsValid(date) ? date.toISOString().split("T")[0] : "";

/**
 * returns a date object of the date in the local timezone, new Date interprets YYYY/MM/DD as UTC
 * @param date string in YYYY/MM/DD format
 * @returns date object
 */
export const parseDateAsLocal = (
  dateStr: string,
  datePattern = /^(\d{4})-(\d{2})-(\d{2})$/
) => {
  const [, year, month, day] = datePattern.exec(dateStr)?.map(Number) ?? [];
  return new Date(year, month - 1, day);
};

/**
 * updates a JS date object based on differences in day, month, and year
 * @param date, difference
 * @returns updated date object
 */
export const updateDate = (
  date: Date,
  difference: { month?: number; year?: number; day?: number }
) => {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  const { month: diffMonth, year: diffYear, day: diffDay } = difference;
  date.setMonth(month + (diffMonth ?? 0));
  date.setFullYear(year + (diffYear ?? 0));
  date.setDate(day + (diffDay ?? 0));
  return date;
};

export const promiseWhile = <T>(
  initialData: T,
  condition: (d: T) => boolean,
  onConditionDo: (d: T) => Promise<T>
) => {
  const iterate: (d: T) => Promise<T> = (data: T) =>
    condition(data) ? onConditionDo(data).then(iterate) : Promise.resolve(data);
  return iterate(initialData);
};

export class PriorityQueue<T> {
  data: { value: T; priority: number }[] = [];

  push(value: T, priority = 0) {
    this.data.push({ value, priority });
  }

  pop() {
    let minIndex = this.data.reduce(
      (minIdx, item, i) =>
        item.priority < this.data[minIdx].priority ? i : minIdx,
      0
    );
    return this.data.splice(minIndex, 1)[0].value;
  }

  size() {
    return this.data.length;
  }
}

export function getRandomInt(min = 0, max = Number.MAX_VALUE) {
  min = Math.ceil(min); // Round up min to ensure it's an integer
  max = Math.floor(max); // Round down max to ensure it's an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class DirectedGraph<T> {
  edges: Record<string, Record<string, T>>;
  constructor(edges: Record<string, Record<string, T>>) {
    this.edges = edges;
  }

  nodes() {
    return Object.keys(this.edges);
  }

  edgesOf(node: string) {
    return Object.keys(this.edges[node] || {});
  }

  cost(node: string, next: string) {
    return this.edges[node]?.[next] ?? Infinity;
  }

  generatePath(
    path: {
      [x: string]: string | undefined;
    },
    goal: string
  ) {
    const result = [];
    for (
      let node: string | undefined = goal;
      node !== undefined;
      node = path[node]
    ) {
      result.push(node);
    }
    return result.reverse();
  }
}

/**
 * Returns a random element from an array.
 * @param array - The array from which to sample a random element.
 * @returns A random element from the array, or undefined if the array is empty.
 */
function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array - The array to shuffle.
 * @returns The shuffled array.
 */
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
  return array;
}
