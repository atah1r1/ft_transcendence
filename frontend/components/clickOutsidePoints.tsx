import { useEffect, useRef, useState } from "react";
import styles from "../styles/chat.module.css";

function useOutsideAlerter(ref: any, setTreePoints: any) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setTreePoints(false);
        // alert("cliked");
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

export default function ClickOutsidePoints({ setTreePoints, content }: any) {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, setTreePoints);

  return <div ref={wrapperRef}>{content}</div>;
}
