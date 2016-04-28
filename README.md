# Uploader JQuery Plugin

A little plugin that creates and styles a UI for uploading a set of files to the server. It includes rendering little thumbnails
when it can, and letting the user add or remove files before sending them up.

On submit, the plugin submits an ajax request containing the files as formdata.

## Getting Started

* You'll need to include jquery.uploader.js in your site's Javascript.

* You should have a section of your page that you want the uploader to take over. The uploader will work on a div or section, and will
empty it before setting up. I suggest having a non-js solution in this section, so that when the uploader starts up, it can clear your nonjs solution in favor of itself.

* Start up the plugin by calling the plugin on the section it's supposed to take over.

      $('.upload-box').uploader(options);

*  **The uploader will not start up if the browser doesn't support FormData (< IE10).**

*  **The uploader will not draw thumbnails if the browser doesn't support FileReader (< IE10)**

* The included styling is optional, if you like the default, include styles.uploader.css in your site's css, or if you're using
SASS, include _uploader.scss in your build. (You can style the uploader yourself as well, see below for details)

## Options

## Styling the Uploader yourself

  The css in uploader.css / _uploader.scss includes show / hides and other functional type styling you'll need to replicate.
  Here's a list of the classes I have, and what they do, that you'll need to replicate:

    .show {
      display: block;
    }
    .hide {
      display: none;
    }

## Is the uploader Unit Tested?

  Kinda, I wrote tests to test the public interface, but I didn't unit test internal functions.
  You can run the tests I have by:

    npm run tests
