import React, { FC } from 'react'
import { ReactComponent as Slug } from "./slug.svg";
import "./SlugHeader.scss"

const SlugHeader: FC = () => {
    return (
        <div className="header">
                <Slug />
                Slug Scheduler
        </div>
    );
}

export default SlugHeader;
