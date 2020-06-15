import MessageBuilder from './index'

export default function createMessageBuilder (data, defaultValues = {}) {
  if (data instanceof MessageBuilder) {
    return data
  }

  return new MessageBuilder(data, defaultValues)
}
