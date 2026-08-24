export const isInCurrentMonth = (dateValue?: string | null): boolean => {
  if (!dateValue) return false;

  const now = new Date();
  const yearMonthMatch = dateValue.match(/^(\d{4})-(\d{2})/);

  if (yearMonthMatch) {
    const year = Number(yearMonthMatch[1]);
    const monthIndex = Number(yearMonthMatch[2]) - 1;

    if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      return false;
    }

    return year === now.getFullYear() && monthIndex === now.getMonth();
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return false;

  return parsedDate.getFullYear() === now.getFullYear() && parsedDate.getMonth() === now.getMonth();
};
