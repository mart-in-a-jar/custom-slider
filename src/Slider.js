import {
    mdiLock,
    mdiLockOpen,
    mdiCheckBold,
    mdiCloseThick,
    mdiChevronRight,
} from "@mdi/js";
import Icon from "@mdi/react";
import { useCallback, useEffect, useRef, useState } from "react";
import "./Slider.scss";
import loadingSpinner from "./loadingSpinner.svg";

const callAction = async (action) => {
    try {
        const result = await action();
        console.log(result);
        return result === "Success";
    } catch (error) {
        console.log(error);
        return false;
    }
};

// clickAway means you have to manually "reset" slider
export const Slider = ({
    action,
    text,
    indicators,
    clickAway = false,
    gradient = true,
}) => {
    const [mouseIsDown, setMouseIsDown] = useState(false);
    const [totalTravelDistance, setTotalTravelDistance] = useState(null);
    const [dragStartPosition, setDragStartPosition] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [shouldScale, setShouldScale] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setstatus] = useState(null);

    const sliderContainerRef = useRef(null);
    const sliderRef = useRef(null);
    const textRef = useRef(null);
    const indicatorRef = useRef(null);

    useEffect(() => {
        if (mouseIsDown) {
            addListeners();
            return;
        }
        removeListeners();
        setShouldScale(false);
    }, [mouseIsDown]);

    useEffect(() => {
        if (!isUnlocked) return;
        (async () => {
            setIsLoading(true);

            // display result for a time
            if (await callAction(action)) {
                setstatus({ success: true, text: "Door opened!" });
            } else {
                setstatus({
                    success: false,
                    text: "Something went wrong!",
                });
            }
            if (!clickAway) {
                setTimeout(() => {
                    setstatus(null);
                }, 2500);
            }

            setIsLoading(false);

            textRef.current.style.opacity = 1;
            indicatorRef.current.style.opacity = 1;

            if (!clickAway) {
                setIsUnlocked(false);
            }
        })();
    }, [isUnlocked]);

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
            const portionMoved = movement / totalTravelDistance;
            textRef.current.style.opacity = 1 - portionMoved;
            indicatorRef.current.style.opacity = 1 - portionMoved;
            if (gradient) {
                sliderContainerRef.current.style.background = `linear-gradient(90deg, ${gradientColor} ${
                    portionMoved * 100
                }%, ${bgColor} ${portionMoved * 100}%)`;
            }
        },
        [dragStartPosition, totalTravelDistance]
    );

    const handleTouchEnd = useCallback(
        (e) => {
            if (!mouseIsDown) return;
            setMouseIsDown(false);
            const pos = e.clientX || e.changedTouches[0].clientX;
            const movement = pos - dragStartPosition;
            if (gradient) {
                sliderContainerRef.current.style.background = bgColor;
            }
            // when released before end of slider
            if (movement < totalTravelDistance) {
                textRef.current.style.opacity = 1;
                indicatorRef.current.style.opacity = 1;
                sliderRef.current.style.left = `${sliderOffset}px`;
                return;
            }
            // when released at end of slider
            setTimeout(() => {
                setIsUnlocked(true);
            }, 0);
        },
        [dragStartPosition, totalTravelDistance]
    );

    // When unlocked, to reset slider
    const handleClick = () => {
        if (!isUnlocked || !clickAway) return;
        setIsUnlocked(false);
        setTimeout(() => {
            setstatus(null);
        }, 2500);
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
        transition: !mouseIsDown ? "opacity .5s ease-in, color .7s ease" : "",
    };

    return (
        <div className="slider-container" ref={sliderContainerRef}>
            <span
                className={`text${
                    status ? (status.success ? " success" : " error") : ""
                }`}
                ref={textRef}
                style={textStyles}
            >
                {status?.text || text}
            </span>
            {indicators && !status && (
                <span className="arrows" ref={indicatorRef}>
                    <Icon path={mdiChevronRight} size={3} />
                    <Icon path={mdiChevronRight} size={3} />
                    <Icon path={mdiChevronRight} size={3} />
                    <Icon path={mdiChevronRight} size={3} />
                </span>
            )}
            <div
                className={`slider${isUnlocked ? " unlocked" : ""}`}
                ref={sliderRef}
                style={sliderStyles}
                onTouchStart={handleTouchStart}
                onMouseDown={handleTouchStart}
                onClick={handleClick}
            >
                {isLoading ? (
                    <img
                        src={loadingSpinner}
                        alt="loading"
                        className="icon loading"
                    />
                ) : status ? (
                    status.success ? (
                        <Icon
                            path={mdiCheckBold}
                            size={3}
                            className="icon success"
                        />
                    ) : (
                        <Icon
                            path={mdiCloseThick}
                            size={3}
                            className="icon error"
                        />
                    )
                ) : isUnlocked || shouldScale ? (
                    <Icon path={mdiLockOpen} size={3} className="icon" />
                ) : (
                    <Icon path={mdiLock} size={3} className="icon" />
                )}
            </div>
        </div>
    );
};

const sliderOffset = -10;
const bgColor = "#ffffff4d";
const gradientColor = "#1e2135";
