
export function formatDate(date: Date): string {
  return date.toLocaleDateString(
    "en-US",
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

export function stringify(value: any): string {
  return JSON.stringify(value);
}