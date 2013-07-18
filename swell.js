var FullScreen = (
	function()
	{
		var done = false;

		function init()
		{
			//make sure this can only run once
			if (done)
			{
				return;
			}
			done = true;

			/*
			 * set some variables that tell us what device we're using
			 */
			var isIphone        = isIPhone();
			var isIpad          = isIPad();
			var isAndroidOs     = isAndroid();
			var isChrome        = isChromeBrowser();
			var androidVersion  = null; //accurate to one minor revision

			/*
			 * get the initial phone orientation
			 */
			var phoneOrientation = window.orientation;

			//orientation offest explained later
			var orientationOffset = 0;


			//if it's an Android phone find out what version
			if (isAndroidOs)
			{
				androidVersion = getAndroidVersion();

				/*
				 * work out the orientation 'offset'
				 *
				 * the default orientation on some Android devices is 'landscape' so we need to check
				 * that the width:height ratio is what we would expect for the orientation the
				 * device is reporting. Otherwise we need to calculate an offset value
				 */
				if (window.orientation == 0|| window.orientation ==180)
				{
					orientationOffset = screen.height > screen.width ? 0 : 90;
				}

				if (window.orientation == 90|| window.orientation ==-90)
				{
					orientationOffset = screen.height < screen.width ? 0 : 90;
				}
			}

			/* On android 4+ orientation event gets fired before browser has actually worked out how to display things in the
			 * new orientation so it's pretty useless. Need to use resize event for android.
			 * Android <3 doesn't fire orientation event so that doesn't matter. We need a different
			 * method to handle the old Android phones because they behave differently - more on this later.
			 *
			 * Whacker than a bag of hammers.
			 */
			if (isAndroidOs && !isChrome)
			{
				if (androidVersion < 3)
				{

					window.addEventListener('resize', oldAndroidResizeHandler);
				}
				else
				{
					window.addEventListener('resize', resizeHandler);
				}
			}
			else
			{
				window.addEventListener('orientationchange', orientationChangeHandler);
			}

			/**
			 * Method used to handle re-orientation on android 3+
			 */
			function resizeHandler()
			{
				/*
				 * opening the keyboard triggers a resize event so check
				 * that the orientation has actually changed
				 */
				if (window.orientation == phoneOrientation) return;

				/*
				 * remember the new orientation
				 */
				phoneOrientation = window.orientation;

				/*
				 * for Android 3+ we reset the Document after we last hid the URL bar
				 * (for reasons that are explained in other comments). So all we need
				 * to do here is give the browser 200ms to come to terms with the fact
				 * that it has been re-oriented then hide the URL bar.
				 */
				setTimeout(hideUrlBar,400);
			}

			/**
			 * Method used to handle re-orientation on Android <=2.3
			 */
			function oldAndroidResizeHandler()
			{
				/*
				 * Older Android seems to fire resize events for loads of things sometimes it seems
				 * almost random. We need to check that the orientation has actually changed before we do anything
				 */
				if (window.orientation == phoneOrientation) return;

				/*
				 * remember the new orientation
				 */
				phoneOrientation = window.orientation;

				/*
				 * we need to reset the styles that have been added to the document to allow
				 * the browser to calculate it's new natural height. Then give the browser
				 * 200ms to come to terms with the changes and hide the URL bar
				 */
				resetDocument();

				setTimeout(hideUrlBar,400);
			}

			/**
			 * method used to handle re-orientation on iOS
			 */
			function orientationChangeHandler()
			{
				/*
				* if we're running on an iPhone reset the document styles - to allow the device
				* to calculate DOM dimensions for the new orientation
				*
				* then hide the URL bar again
				*/

				if (isIphone)
				{
					resetDocument();
					hideUrlBar();
					return;
				}

				/*
				 * if it's an iPad or Android running chrome then just publish the orientation change
				 */
				publishChange();
			}

			/**
			 * reset any height style applied to the document
			 */
			function resetDocument()
			{
				document.documentElement.style.height = '';
			}

			/**
			 * method to hide the URL bar from the visible area of the screen
			 */
			function hideUrlBar()
			{
				//iPhone and android 2.3 need 60 extra pixels to hide the URL bar android 4 only 52
				var additionalHeight = isAndroidOs && androidVersion >=3 ? 52 : 60;

				var fullheight = document.documentElement.clientHeight + additionalHeight;

				document.documentElement.style.height = fullheight + 'px';

				//scroll the URL bar above the top of the screen
				window.scrollTo(0,1);

				//publish the fact that orientation has changed with a value of true or false specifying whether the orientation is landscape
				publishChange();
				/*
				 * on Android 4 afer we've set the height we give it 200ms then clear
				 * the style set on the document. Android 4 maintains the fullscreen height
				 * even after we've cleared it and doesn't try and bring back the URL bar (unlike the other OSs).
				 *
				 * We need to do this otherwise it becomes very difficult to reset the height on
				 * re-orientation. As Android 4 remembers the height - if you re-orientate then clear
				 * the size isn't adjusted to the new re-oriented screen size. The current size of the document
				 * overrides the screen size so 100% = whatever the current document size is.
				 */
				 if (isAndroidOs && androidVersion >= 3)
				 {
					setTimeout(resetDocument,200);
				 }
			}

			function publishChange()
			{
				/*
				here is where we can publish to the rest of our app that we are ready and pass something like this:
				(window.orientation + orientationOffset == 90 || window.orientation + orientationOffset == -90);
				telling our app whether we're in landscape or portrait
				*/
			}

			/*
			 * on load - if it's not an iPad and not chrome then hide the URL bar
			 * use a 0 timeout to give iOS a chance to calculate
			 * the correct DOM dimensions
			 */
			  if (!isIpad && !isChrome) setTimeout(hideUrlBar, 0);
		}

		return {init:init};
	})();