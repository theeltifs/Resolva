const svg = (path, opts = {}) => {
  const { size = 18, viewBox = "0 0 24 24", stroke = "currentColor", fill = "none", strokeWidth = 1.75 } = opts;
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
    >
      {path}
    </svg>
  );
};

export const IconBolt = ({ size = 18 }) =>
  svg(<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />, { size });

export const IconChat = ({ size = 18 }) =>
  svg(
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </>,
    { size }
  );

export const IconBarChart = ({ size = 18 }) =>
  svg(
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>,
    { size }
  );

export const IconTicket = ({ size = 18 }) =>
  svg(
    <>
      <path d="M2 9a2 2 0 0 1 0-4V3h20v2a2 2 0 0 1 0 4v2a2 2 0 0 1 0 4v2H2v-2a2 2 0 0 1 0-4V9z" />
    </>,
    { size }
  );

export const IconUploadCloud = ({ size = 18 }) =>
  svg(
    <>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </>,
    { size }
  );

export const IconWarning = ({ size = 16 }) =>
  svg(
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>,
    { size }
  );

export const IconSend = ({ size = 18 }) =>
  svg(
    <path d="M12 19V5M5 12l7-7 7 7" />,
    { size }
  );

export const IconCheckCircle = ({ size = 18 }) =>
  svg(
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>,
    { size }
  );

export const IconAlertCircle = ({ size = 18 }) =>
  svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>,
    { size }
  );

export const IconTarget = ({ size = 18 }) =>
  svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>,
    { size }
  );

export const IconInbox = ({ size = 32 }) =>
  svg(
    <>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>,
    { size }
  );

export const IconFile = ({ size = 32 }) =>
  svg(
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>,
    { size }
  );

export const IconUploadArrow = ({ size = 16 }) =>
  svg(
    <>
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </>,
    { size }
  );

export const IconCheck = ({ size = 14 }) =>
  svg(
    <polyline points="20 6 9 17 4 12" />,
    { size }
  );

export const IconDotFilled = ({ color = "#f59e0b", size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: "block", flexShrink: 0 }}>
    <circle cx="5" cy="5" r="5" fill={color} />
  </svg>
);
