import { useEffect, useRef} from "react";

function useOutsideAlerter(ref: any, setTreePoints: any, setGroupBox: any) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setGroupBox(false);
        setTreePoints(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export default function ClickOutsidePoints({
  setTreePoints,
  setGroupBox,
  content,
}: any) {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, setTreePoints, setGroupBox);

  return <div ref={wrapperRef}>{content}</div>;
}
