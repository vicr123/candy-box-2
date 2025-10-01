import {useRef, useState} from "react";
import Draggable from "react-draggable";

import Styles from "./TrackerWindow.module.css"
import TrackerHeaderStyles from "./TrackerHeader.module.css"
import {TrackerHeader} from "./TrackerHeader";
import { TrackerFooter } from "./TrackerFooter";
import {useTracker} from "./useTrackerController";
import {LocationsTracker} from "./LocationsTracker";
import {NavigationTracker} from "./NavigationTracker";
import {MouseEvent} from "react";

const RESIZE_MARGIN = 8;

type ResizeEdge = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

export function TrackerWindow() {
    const {currentTab, rolledUp} = useTracker();
    const nodeRef = useRef<HTMLDivElement>({} as any);

    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(700);
    const [position, setPosition] = useState({x: 100, y: 100})
    const [cursor, setCursor] = useState('default');
    const [isResizing, setIsResizing] = useState(false);

    const getResizeEdge = (e: MouseEvent<HTMLDivElement>): ResizeEdge => {
        if (rolledUp) {
            return null;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const nearTop = y < RESIZE_MARGIN;
        const nearBottom = y > rect.height - RESIZE_MARGIN;
        const nearLeft = x < RESIZE_MARGIN;
        const nearRight = x > rect.width - RESIZE_MARGIN;

        if (nearTop && nearLeft) return 'top-left';
        if (nearTop && nearRight) return 'top-right';
        if (nearBottom && nearLeft) return 'bottom-left';
        if (nearBottom && nearRight) return 'bottom-right';
        if (nearTop) return 'top';
        if (nearBottom) return 'bottom';
        if (nearLeft) return 'left';
        if (nearRight) return 'right';

        return null;
    };

    const getCursor = (edge: ResizeEdge): string => {
        switch (edge) {
            case 'top':
            case 'bottom':
                return 'ns-resize';
            case 'left':
            case 'right':
                return 'ew-resize';
            case 'top-left':
            case 'bottom-right':
                return 'nwse-resize';
            case 'top-right':
            case 'bottom-left':
                return 'nesw-resize';
            default:
                return 'default';
        }
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (isResizing) return;

        const edge = getResizeEdge(e);
        setCursor(getCursor(edge));
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        const edge = getResizeEdge(e);
        if (!edge) return;

        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        console.log("rs");

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = width;
        const startHeight = height;
        const rect = nodeRef.current.getBoundingClientRect();
        const startLeft = position.x;
        const startTop = position.y;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (edge.includes('right')) {
                setWidth(Math.max(200, startWidth + deltaX));
            }
            if (edge.includes('left')) {
                const newWidth = Math.max(200, startWidth - deltaX);
                setWidth(newWidth);

                const newLeft = startLeft + (startWidth - newWidth);
                setPosition(pos => ({x: newLeft, y: pos.y}))
            }
            if (edge.includes('bottom')) {
                setHeight(Math.max(200, startHeight + deltaY));
            }
            if (edge.includes('top')) {
                const newHeight = Math.max(200, startHeight - deltaY);
                setHeight(newHeight);

                const newTop = startTop + (startHeight - newHeight);
                setPosition(pos => ({x: pos.x, y: newTop}))
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return <Draggable
        nodeRef={nodeRef}
        position={position}
        onDrag={(e, delta) => setPosition({x: delta.x, y: delta.y})}
        handle={`.${TrackerHeaderStyles.trackerHeader}`}
    >
        <div ref={nodeRef}>
            <div
                className={Styles.trackerWrapper}
                style={{width: `${width}px`, height: rolledUp ? undefined : `${height}px`, cursor}}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseLeave={() => !isResizing && setCursor('default')}
            >
                <div
                    className={[Styles.trackerWindow, ...(rolledUp ? [Styles.rolledUp] : [])].join(" ")}
                >
                    <TrackerHeader/>
                    {!rolledUp && <>
                        {currentTab == "locations" && <LocationsTracker />}
                        {currentTab == "navigation" && <NavigationTracker />}
                        <TrackerFooter/>
                    </>}
                </div>
            </div>
        </div>
    </Draggable>
}