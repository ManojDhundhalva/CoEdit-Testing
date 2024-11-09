import moment from "moment";

export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    // Extract time part
    const timeOptions = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    };
    const time = date.toLocaleString("en-US", timeOptions); // e.g., "2:30 PM"

    // Extract date part
    const dateOptions = {
        day: "numeric",
        month: "short", // e.g. "Sep"
        year: "numeric",
    };
    const formattedDate = date.toLocaleString("en-US", dateOptions); // e.g., "9 Sep, 2020"

    return `${time} ${formattedDate}`;
};

export const DateFormatter = (dateString) => {
    // Convert and format the date using moment
    const formattedDate = moment(dateString).format("MMMM D, YYYY, h:mm A");
    return formattedDate;
};