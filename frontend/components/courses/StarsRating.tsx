"use client"

import * as React from "react";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";

export default function BasicRating() {
    const [value, setValue] = React.useState<number | null>(0);
    const [rated, setRated] = React.useState<boolean>(false);

    /*const handleRating = (newValue: number | null) => {
        setRated(true);
    };*/

    if (rated) {
        return (
            <p className="mb-2 mr-4 font-medium text-muted-foreground text-xl">Tack för din feedback!</p>
        )
    }

    return (
        <div className="flex flex-col justify-center items-center">
            <p className="mb-2 mr-4 text-muted-foreground font-medium">Hur var den?</p>
            <Box sx={{
                "& > legend": { mt: 2 },
                "& .MuiRating-iconFilled": { color: "var(--font-summary)" },
                "& .MuiRating-iconEmpty": { color: "var(--font-summary)" },
                "& .MuiRating-iconHover": { color: "var(--font-summary)" }
            }}>
                <Rating
                    className="flex gap-4"
                    name="simpel-controlled"
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                        setRated(true);
                    }}
                    size="large"
                />
            </Box>
        </div>
    )
}