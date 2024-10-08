The issue occurs when the previously clicked element, or its parent, is an `<a>` or `<area>` element and is removed from the DOM. TestCafe test fails with error:
```
  1) Uncaught object

   "{"callsite":{"filename":"C:\\testcafe-callsite-issue\\test.js","lineNum":6,"callsiteFrameIdx":5,"stackFrames":[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}],"isV8Frames":true}}"
      was thrown. Throw Error instead.
```

Follow the steps below to reproduce the issue:
- Clone/download the repository.
- Run the following command:
    `npm install`
- Run the test:
    `npm run test`


Issue is not reproducible in native automation mode.


Additional details about the issue:

TestCafe (proxy mode) fails with 'Uncaught object' error on [leaveElement](https://github.com/DevExpress/testcafe/blob/bee56d2b1c0845ba95ba164842f98292449842f8/src/client/automation/playback/move/event-sequence/base.js#L38) when the [prevElement](https://github.com/DevExpress/testcafe/blob/bee56d2b1c0845ba95ba164842f98292449842f8/src/client/automation/playback/move/event-sequence/base.js#L38C47-L38C58) is removed from the DOM, and it (or its parent, which is also removed) is an `<a>` or `<area>` element. The issue happens because subsequent [getParent](https://github.com/DevExpress/testcafe-hammerhead/blob/4b81b8b460696c602fc6c241e4376da91a826a26/src/client/utils/dom.ts#L837) hammerhead's code returns "host", which is a string representing the host in case of `<a>` and `<area>` elements, not an element. This causes a failure when attempting to get its parent again using `nativeMethods.nodeParentNodeGetter.call(el)`.

Tests running in proxy mode began failing after upgrading to version 3.4.0 or higher. The last version without this issue was 3.3.0.
The issue is reproducible after the following change: [DevExpress/testcafe#7995](https://github.com/DevExpress/testcafe/pull/7995/files#diff-ec219363bae65deba245e68ce80584c923c4de802efec3934465e69cae217b40L34-L43)

If you add removed code back, then test does not fail
```
        const prevElementInDocument = prevElement && domUtils.isElementInDocument(prevElement);

        const prevElementInRemovedIframe = prevElement && domUtils.isElementInIframe(prevElement) &&
                                         !domUtils.getIframeByElement(prevElement);

        if (!prevElementInDocument || prevElementInRemovedIframe)
            prevElement = null;
```



Based on the description "removed IE leftovers from src\client\automation," it should not affect tests running in Chrome. However, it did affect them, so I reviewed the code that was originally executed for all browsers but was removed in that commit, and identified the issue. 