import { useState } from 'react';

export default function Hoverable({ as: Tag = 'button', base, hover, children, ...rest }) {
  const [isHover, setIsHover] = useState(false);
  return (
    <Tag
      {...rest}
      style={isHover ? { ...base, ...hover } : base}
      onMouseEnter={(e) => {
        setIsHover(true);
        if (rest.onMouseEnter) rest.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        setIsHover(false);
        if (rest.onMouseLeave) rest.onMouseLeave(e);
      }}
    >
      {children}
    </Tag>
  );
}
