// import React from 'react'

// export function UseResponsive() {

// const [width, setWidth] = useState(window.innerWidth);

//   useEffect(() => {
//     const handleResize = () => setWidth(window.innerWidth);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const scale = width / 375;
//   return scale;
// }

// export const moderateScale = (size, scale, factor = 0.5) =>
//   size + (scale - 1) * size * factor;
