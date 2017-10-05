import * as React from 'react';
import './Hello.css';
function Hello({ name, enthusiasmLevel = 1, onIncrement, onDecrement }) {
    if (enthusiasmLevel <= 0) {
        throw new Error('You could be a little more enthusiastic. :D');
    }
    return (React.createElement("div", { className: "hello" },
        React.createElement("div", { className: "greeting" },
            "Hello ",
            name + getExclamationMarks(enthusiasmLevel)),
        React.createElement("div", null,
            React.createElement("button", { onClick: onDecrement }, "-"),
            React.createElement("button", { onClick: onIncrement }, "+"))));
}
export default Hello;
// helpers
function getExclamationMarks(numChars) {
    return Array(numChars + 1).join('!');
}
