# Editor

## TODO

[ ] Nested lists
[ ] Creating sections
[ ] Moving nodes

## References

https://developer.mozilla.org/en-US/docs/Web/API/Element
https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event
https://developer.mozilla.org/en-US/docs/Web/CSS/::before

```js
function markDirty(element) {
    element.dataset.dirty = true;
}
function isDirty(element) {
    return element.dataset.dirty || false;
}
```