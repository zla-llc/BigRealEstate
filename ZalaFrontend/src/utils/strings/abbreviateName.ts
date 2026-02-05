export const abbreviateName = (
  firstName: string,
  lastName: string,
  useIfEmpty: string,
) => {
  const abbr = `${firstName[0]}${lastName[0]}`.trim();
  if (abbr.length > 0) return abbr;
  return useIfEmpty;
};
