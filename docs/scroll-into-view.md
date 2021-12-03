# Scroll Into View

The `scrollIntoView` behavior is used scroll an element into view within a specific `viewingArea` element.  This behaves similarly to the browsers [`element.scrollIntoView` method](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView), but restricts the scrolling to a specific viewing area.  This is useful if you want to trigger scrolling in an overlay or section without causing the whole page to scroll.

## Usage

```ts
const viewingArea = document.getElementById('viewingArea')
const child = document.getElementById('childToView')

scrollIntoView(child, viewingArea)
```

### With Options
 
```ts
const viewingArea = document.getElementById('viewingArea')
const child = document.getElementById('childToView')
const options: ScrollIntoViewOptions = {
  direction: 'horizontal'
  startMargin: 10
  endMargin: 10
  behavior: 'auto'
}

scrollIntoView(child, viewingArea)
```

## API

The `scrollIntoView` function takes the following arguments.

| Name        | Type                    | Default | Description                                                                              |
| :---------- | :---------------------- | :-----: | :--------------------------------------------------------------------------------------- |
| child       | `Element`               |         | The child element that you would like to bring into view.                                |
| viewingArea | `Element`               |         | A scrollable element that contains the child to bring into view.                         |
| options     | `ScrollIntoViewOptions` |  `{}`   | Options to customize the scrolling behavior. See below for a description of each option. |

### ScrollIntoViewOptions interface

`ScrollIntoViewOptions` is an object with the following interface. All properties are optional and have default behaviors.

| Name        | Type                        | Default      | Description                                                                                                                                                      |
| :---------- | :-------------------------- | :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| direction   | `'horizontal' │ 'vertical'` | `'vertical'` | The direction to scroll the viewing area                                                                                                                         |
| startMargin | `number` of pixels          | 0            | A margin to leave between the start of the viewing area and the start of the child element (if room allows)                                                      |
| endMargin   | `number` of pixels          | 0            | A margin to leave between the end of the viewing area and the end of the child element (if room allows)                                                          |
| behavior    | `ScrollBehavior`            | `'smooth'`   | Behavior for the browser to use when scrolling.  `smooth` will transition with a smooth animation, while `auto` will immediately jump to the new scroll location |
