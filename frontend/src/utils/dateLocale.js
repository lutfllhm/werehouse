// Locale Indonesia untuk date-fns
export const id = {
  code: 'id',
  formatDistance: () => '',
  formatRelative: () => '',
  localize: {
    ordinalNumber: (n) => n,
    era: () => '',
    quarter: () => '',
    month: (n) => {
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return months[n];
    },
    day: () => '',
    dayPeriod: () => ''
  },
  formatLong: {},
  match: {}
};
