// https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html

var LibJsToDef = {

        $JsToDef: {
            _callback_object: null,
            _callback_string: null,
            _callback_empty: null,
            _callback_number: null,
            _callback_bool: null,
            send: function(message_id, message){
                if (JsToDef._callback_object) {
                    if (!message_id) {
                        console.warn("You need to send message_id");
                        return;
                    }
                    var msg_id = stringToNewUTF8(message_id);
                    switch (typeof message) {
                        case 'undefined':
                            {{{ makeDynCall("vi", "JsToDef._callback_empty")}}}(msg_id);
                            break;
                        case 'number':
                            {{{ makeDynCall("vif", "JsToDef._callback_number")}}}(msg_id, message);
                            break;
                        case 'string':
                            var msg = stringToNewUTF8(message);
                            {{{ makeDynCall("viii", "JsToDef._callback_string")}}}(msg_id, msg, lengthBytesUTF8(message));
                            Module._free(msg);
                            break;
                        case 'object':
                            if (message instanceof ArrayBuffer || ArrayBuffer.isView(message)) {
                                var msg_arr = new Uint8Array(ArrayBuffer.isView(message) ? message.buffer : message);
                                var msg = _malloc(msg_arr.length * msg_arr.BYTES_PER_ELEMENT);
                                HEAPU8.set(msg_arr, msg);
                                {{{ makeDynCall("viii", "JsToDef._callback_string")}}}(msg_id, msg, msg_arr.length);
                                Module._free(msg);
                            } else {
                                var msg = JSON.stringify(message);
                                var serialized_msg = stringToNewUTF8(msg);
                                {{{ makeDynCall("viii", "JsToDef._callback_object")}}}(msg_id, serialized_msg, lengthBytesUTF8(msg));
                                Module._free(serialized_msg);
                            }
                            break;
                        case 'boolean':
                            var msg = message ? 1 : 0; 
                            {{{ makeDynCall("vii", "JsToDef._callback_bool")}}}(msg_id, msg);
                            break;
                        default:
                            console.warn("Unsupported message format: " + (typeof message));
                    }
                    Module._free(msg_id);
                } else {
                    console.warn("You didn't set callback for JsToDef")
                }
            }
        },

        JsToDef_RegisterCallbacks: function(callback_object, callback_string, callback_empty, callback_number, callback_bool) {
            JsToDef._callback_object = callback_object;
            JsToDef._callback_string = callback_string;
            JsToDef._callback_empty = callback_empty;
            JsToDef._callback_number = callback_number;
            JsToDef._callback_bool = callback_bool;
        },

        JsToDef_RemoveCallbacks: function() {
            JsToDef._callback_object = null;
            JsToDef._callback_string = null;
            JsToDef._callback_empty = null;
            JsToDef._callback_number = null;
            JsToDef._callback_bool = null;
        },

}

autoAddDeps(LibJsToDef, '$JsToDef');
addToLibrary(LibJsToDef);
