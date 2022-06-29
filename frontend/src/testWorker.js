self.onmessage = function (event) {
  if (event.data.action === 'initialize') {
    console.log('starting web worker....', event);
    const ws = new WebSocket(event.data.payload.url);
    ws.onopen = (event) => {
      console.log('wsOnOpen:', event);
    };
    ws.onmessage = function (event) {
      try {
        self.postMessage({
            action: 'result',
            payload: event.data,
          },
          [],);
      } catch (err) {
        self.postMessage(
          {
            action: 'error',
            payload: err,
          });
      }
    };
  }
};
