# Vue Media Library
A vue component for the `mdixon18/media-library` package.

Laravel package can be found [here](https://github.com/mdixon18/media-library).

## Screenshots
**Manager**

![Manager](https://i.ibb.co/rcGNGwv/Screenshot-2019-06-07-at-11-57-03.png)

**Field**

![Empty field](https://i.ibb.co/c8H4MrT/Screenshot-2019-06-07-at-11-59-58.png)
![Field with image selected](https://i.ibb.co/vHGNvBb/Screenshot-2019-06-07-at-11-56-45.png)

## Installation
```
npm install --save vue-medialibrary
```

### Usage
#### Vue
```
    import  MediaLibrary  from  'vue-medialibrary';
    
    Vue.use(MediaLibrary, {
	    API_URL: 'http://urltoapp.tld'
    });
```
The API_URL is helpful if the application you are using the component in isn't the same application that the Laravel package is installed on. E.g. an SPA.

#### HTML Template

**Manager**
```
    <vue-medialibrary-manager v-if="show" />
```

**Field**
```
    <vue-medialibrary-field v-model="file" />
```

## Manager API
### Events
 - `@close` - this is used when the user has selected the close button in the manager, this should toggle off your original `v-if`. Naturally without a `v-if` this component will display at all times.
 - `@select` - this is primarily used within the field component so shouldn't be required, but it is triggered when the insert button has been selected on a media item. Only works if the `selectable` prop is set to `true`.
 - `@fail-to-find` - again primarily used within the field component so shouldn't be required. This will when a value is already set on the field component go and find that file so when the manager is opened that file is shown in the window on the right.  Only works if the `selectable` prop is set to `true`.

### Props
| Prop | Type | Default | Description
|--|--|--|--|
| `types` | `Object` | `{ images: true, files: true }` | Property controls whether both images and files can be toggled. Useful if you want to only use images or files. |
| `filetypes` | `Array` | `[]` | To limit the media to only certain file types. E.g. `[ 'png', 'jpg' ]`. |
| `selectable` | `Boolean` | `false` | Used by the field component but allows the media to be selectable, which also allows you to use the `@select` event. |
| `selected` | `String` | `null` | Used by the field component but allows you to pass in a filename which will then be automatically opened on the right window e.g. `test.jpg`. This will also cause the `@fail-to-find` event to be in operation.|


## Field API
### Events
 - `@close` - this is used when the user has selected the close button in the manager, this should toggle off your original `v-if`. Naturally without a `v-if` this component will display at all times.
 - `@select` - this is primarily used within the field component so shouldn't be required, but it is triggered when the insert button has been selected on a media item. Only works if the `selectable` prop is set to `true`.
 - `@fail-to-find` - again primarily used within the field component so shouldn't be required. This will when a value is already set on the field component go and find that file so when the manager is opened that file is shown in the window on the right.  Only works if the `selectable` prop is set to `true`.

### Props
| Prop | Type | Default | Description
|--|--|--|--|
| `types` | `Object` | `{ images: true, files: true }` | Property controls whether both images and files can be toggled within the manager. Useful if you want to only use images or files. |
| `filetypes` | `Array` | `[]` | To limit the media to only certain file types. E.g. `[ 'png', 'jpg' ]` in the manager. |
| `helper` | `String` | `null` | This allows you to put helpful message/text into the field. E.g. 'Maximum image width: 100px'. |

## Future features
Just some ideas in the making...

 - Drag & Drop, this currently doens't work - you have to use the button currently.
 - Support multiple image variations. e.g. Responsive images.
 -  Ability to multi select, or create a repeatable field for multiple images.
