import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles, Colors } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  container: {
    paddingBottom: Metrics.baseMargin
  },
  logo: {
    marginTop: Metrics.doubleSection,
    height: Metrics.images.logo,
    width: Metrics.images.logo,
    resizeMode: 'contain'
  },
  centered: {
    alignItems: 'center'
  },
  textInput: {
    height: 50, 
    color: Colors.charcoal, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.cloud,
    marginTop: 15
  },
  button: {
    height: 50,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 30
  },
  buttonTitle: {
    color: Colors.snow,
    fontSize: 15
  }
})
