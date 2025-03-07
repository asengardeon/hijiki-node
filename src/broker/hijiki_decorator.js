function queueConsumer(queueName) {
    return function (target, key, descriptor) {
        if (!target.consumers) {
            target.consumers = [];
        }
        target.consumers.push({ queueName, method: descriptor.value });
        return descriptor;
    };
}

export default queueConsumer;
