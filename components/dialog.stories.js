import Dialog from './dialog'

export default {
  title: 'MyApp/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    status: {
      //defaultValue: 0,
      options: [0, 1],
      control: { type: 'radio' },
    },
    onConfirm: { action: 'onConfirm' },
    onClose: { action: 'onClose' },
    onStatus: { action: 'onStatus' },
  },
}

const Template = (args) => <Dialog {...args} />

export const Title = Template.bind({})

Title.args = {
  title: 'Dialog Title',
  caption: 'Lorem ipsum dolor sit amet sequi velit qui natus.',
  status: 0,
}

export const NoTitle = Template.bind({})

NoTitle.args = {
  caption: 'Lorem ipsum dolor sit amet sequi velit qui natus.',
  status: 1,
};
