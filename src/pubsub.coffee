# Bare bones, fast publish subscribe. Will return an object that lets you drive
# the events; you can also pass in an object that will be augmented with the functions
# directly.

# EXAMPLE
# var my_events = br_pubsub();
#
# fn = function(value) { alert(value); }
# my_events.on("echo", fn);
# my_events.on("echo", fn);
#
# my_events.emit("echo", ["hello!"]); // hello! hello!
# my_events.off("echo", fn);
# my_events.emit("echo", ["hello!"]); // ...

do (p = Physics) ->
  p.pubsub = (subject = {}) ->
    functions = {}

    subject.on = (topic, callback) ->
      functions[topic] = [] if(!functions[topic])
      functions[topic].push(callback)

      subject

    subject.emit = (topic, args) ->
      return unless functions[topic]

      fn.apply(subject, args || []) for fn in functions[topic]

      subject

    subject.off = (topic, func) ->
      if !topic
        functions = {}
      else if !func
        functions[topic] = []
      else
        functions[topic].splice(i, 1) for fn in functions[topic] when fn == func

      subject

    subject
