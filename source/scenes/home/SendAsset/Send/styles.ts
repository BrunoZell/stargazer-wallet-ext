import { StyleSheet } from 'react-native';
import { COLORS } from 'assets/styles/_variables';

const styles = StyleSheet.create({
  layout: {
    backgroundColor: COLORS.grey_light_100,
    flexGrow: 1,
  },
  content: {
    flex: 1,
    marginHorizontal: 30,
  },
  balance: {
    alignItems: 'center',
    marginVertical: 30,
  },
  form: {},
  input: {
    marginBottom: 0,
  },
  inputRightIcon: {
    marginHorizontal: 15,
    color: 'orange'
  },
  estimate: {
    marginVertical: 20,
  },
  error: {
    marginBottom: 20,
  },
  gasSettings: {
    marginTop: 0,
    backgroundColor: COLORS.gray_light,
    padding: 5,
    borderRadius: 10,
  },
  gasSettingsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gasSettingInputContainer: {
    backgroundColor: COLORS.white,
    width: 100,
    height: 30,
    borderRadius: 10,
    padding: 6,
    marginTop: 10,
    borderWidth: 1,
  },
  gasSettingLabelLeft: {
    flex: 1,
  },
  gasSettingLabelRight: {
    paddingTop: 10,
  },
  gasSettingsSlider: {
  },
  gasSettingsEstimate: {
    marginTop: 20,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    marginVertical: 24,
    justifyContent: 'space-evenly'
  },
  button: {
    marginRight: 10
  },
  qrCodeButton: {
    marginLeft: 10
  },
  recipientButtons:{
    flexDirection: 'row', 
    alignItems: 'center'
  },

});

export default styles;