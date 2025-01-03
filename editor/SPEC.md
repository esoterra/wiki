# Spec

TODO: set contenteditable to plain text only when available in firefox (currently in nightly) or overwrite paste operation to use plain text

## Initialization

1. Verify that document structure invariants are met true, raising an error if not.
2. Assign attributes to elements so that remaining invariants are met.

## Invariants

1. The editor root has only `section`/`p`/`ul`/`ol` child elements and must always have at least one such child.
2. Any `section` elements must contain an `hN`element where `N` corresponds to the nesting level of the section followed by zero or more `section`/`p`/`ul`/`ol`.
3. Any `ul` or `ol` elements must contain one or more `li` items.
4. All `hN`/`p`/`li` elements in the editor must have `spellcheck="true"`, `contenteditable="true"`, and an id of the form `wedit-N`.
5. All `wedit-N` ids assigned at initialization must be in document order.
6. All `wedit-N` ids assigned to newly-created elements must be in increasing order starting from the `N` one higher than the highest initial id.


## Creating/deleting elements

* When the user hits enter at the end of a `p` element, create a new `p` element inserted after it and select it.
* When the user hits enter in an empty `li` element, delete it, split the containing `ul`/`ol` into two containing the parts before and after, insert a `p`, and select it.
* When the user hits enter at the end of a non-empty `li` element, create a new element of the same kind inserted after it and select it.
* When the user hits backspace in an empty `p`/`li` element, delete it and select the first `contenteditable` element before it. If this deletes the last `li` in its parent `ul`/`ol`, delete its parent too. If this causes two `ul` or two `ol` elements to become siblings, merge them.

TODO: merging/unmerging lists



## Specializing elements

* When the user would make the value of a `p` element `* ` (asterisk space), delete it, create a `ul` element, create an `li` element in it, and select that `li` element.
* When the user would make the value of a `p` element `1. ` (one period space), delete it, create a `ol` element, create an `li` element in it, and select that `li` element.
* When the user would make the value of a `p` element `# ` (pound-sign space)

## Navigation

* When the user hits the up arrow key while on the top line of an element, select the element above.
* When the user hits the down arrow key while on the bottom line of an element, select the element below.
* When the user navigates to an offscreen element, move it onto screen.

## Moving Elements