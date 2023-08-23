import "./Slider.scss";
import Icon from "@mdi/react";
import { mdiLock, mdiLockOpen } from "@mdi/js";
import { useCallback, useEffect, useRef, useState } from "react";

export const Slider = ({ action, text }) => {
    const [mouseIsDown, setMouseIsDown] = useState(false);
    const [totalTravelDistance, setTotalTravelDistance] = useState(null);
    const [dragStartPosition, setDragStartPosition] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [shouldScale, setShouldScale] = useState(false);

    const sliderContainerRef = useRef(null);
    const sliderRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        if (mouseIsDown) {
            addListeners();
            return;
        }
        removeListeners();
        setShouldScale(false);
    }, [mouseIsDown]);

    useEffect(() => {
        if (isUnlocked) {
            // loading
            // await
            action();
            // stop loading
        }
    }, [isUnlocked, action]);

    const handleTouchStart = (e) => {
        setMouseIsDown(true);
        setDragStartPosition(e.clientX || e.changedTouches[0].clientX);
        setTotalTravelDistance(
            sliderContainerRef.current.clientWidth -
                sliderRef.current.clientWidth -
                sliderOffset
        );
    };

    const handleMove = useCallback(
        (e) => {
            if (!mouseIsDown) return;
            const pos = e.clientX || e.changedTouches[0].clientX;
            const movement = pos - dragStartPosition;
            if (movement <= 0) {
                moveSlider(sliderOffset);
                return;
            }
            if (movement >= totalTravelDistance - sliderOffset) {
                moveSlider(totalTravelDistance);
                // scale slider
                if (!shouldScale) {
                    setShouldScale(true);
                }
                return;
            }
            setShouldScale(false);
            moveSlider(movement);
            textRef.current.style.opacity = 1 - movement / totalTravelDistance;
        },
        [dragStartPosition, totalTravelDistance]
    );

    const handleTouchEnd = useCallback(
        (e) => {
            if (!mouseIsDown) return;
            setMouseIsDown(false);
            const pos = e.clientX || e.changedTouches[0].clientX;
            const movement = pos - dragStartPosition;
            // when released before end of slider
            if (movement < totalTravelDistance) {
                sliderRef.current.style.left = `${sliderOffset}px`;
                textRef.current.style.opacity = 1;
                return;
            }
            // when released at end of slider
            setTimeout(() => {
                setIsUnlocked(true);
            }, 0);

            // trigger action
            // when action is complete
            // add class for unlocked
            // add onClick for remove class
            // change icon
            // in onclick function -> remove onClick function
        },
        [dragStartPosition, totalTravelDistance]
    );

    // When unlocked, to reset slider
    const handleClick = () => {
        if (!isUnlocked) return;
        setIsUnlocked(false);
    };

    const moveSlider = (pos) => {
        sliderRef.current.style.left = `${pos}px`;
    };

    const addListeners = useCallback(() => {
        document.addEventListener("mouseup", handleTouchEnd);
        document.addEventListener("touchend", handleTouchEnd);
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("touchmove", handleMove);
    }, [handleTouchEnd, handleMove]);

    const removeListeners = useCallback(() => {
        document.removeEventListener("mouseup", handleTouchEnd);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("touchmove", handleMove);
    }, [handleTouchEnd, handleMove]);

    const sliderStyles = {
        left: isUnlocked ? 0 : sliderOffset,
        transform: shouldScale ? "scale(1.15)" : "scale(1)",
        transition: !mouseIsDown
            ? `left .5s ease-in, width .5s ease-in, ${
                  isUnlocked
                      ? "height .1s linear, border-radius .1s linear"
                      : "height .5s linear, border-radius .5s cubic-bezier(1,0,1,0)"
              }`
            : "transform .2s ease-in-out",
    };

    const textStyles = {
        transition: !mouseIsDown ? "opacity .5s ease-in" : "",
    };

    return (
        <div className="slider-container" ref={sliderContainerRef}>
            <span className="text" ref={textRef} style={textStyles}>
                {text}
            </span>
            <div
                className={`slider${isUnlocked ? " unlocked" : ""}`}
                ref={sliderRef}
                style={sliderStyles}
                onTouchStart={handleTouchStart}
                onMouseDown={handleTouchStart}
                onClick={handleClick}
            >
                {isUnlocked || shouldScale ? (
                    <Icon path={mdiLockOpen} size={3} className="icon" />
                ) : (
                    <Icon path={mdiLock} size={3} className="icon" />
                )}
            </div>
        </div>
    );
};

const sliderOffset = -10;
