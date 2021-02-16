import React, {useCallback, useEffect, useState} from 'react';
import {AddNotebookEvent} from '../../components/DialogManager/recievers';
import {Placeholder} from '../../components/ListPlaceholders';
import SimpleList from '../../components/SimpleList';
import {useTracked} from '../../provider';
import {Actions} from '../../provider/Actions';
import {ContainerBottomButton} from '../../components/Container/ContainerBottomButton';
import {eSendEvent} from '../../services/EventManager';
import SearchService from '../../services/SearchService';
import {eScrollEvent} from '../../utils/Events';
import Navigation from '../../services/Navigation';
import {DDS} from '../../services/DeviceDetection';

export const Folders = ({route, navigation}) => {
  const [state, dispatch] = useTracked();
  const notebooks = state.notebooks;
  const [loading, setLoading] = useState(true);
  let pageIsLoaded = false;
  let ranAfterInteractions = false;

  const InteractionManager = {
    runAfterInteractions:(func) => setTimeout(func,300)
  }
  const onFocus = useCallback(() => {
    if (!ranAfterInteractions) {
      ranAfterInteractions = true;
      runAfterInteractions();
    }

    if (!pageIsLoaded) {
      pageIsLoaded = true;
      return;
    }
    Navigation.setHeaderState(
      'Notebooks',
      {
        menu: true,
      },
      {
        heading: 'Notebooks',
        id: 'notebooks_navigation',
      },
    );
 
  }, []);

  const runAfterInteractions = () => {
    InteractionManager.runAfterInteractions(() => {
      if (loading) {
        setLoading(false);
      }
      Navigation.routeNeedsUpdate('Notebooks',() => {
        dispatch({type:Actions.NOTEBOOKS})
      })

      eSendEvent(eScrollEvent, {name: 'Notebooks', type: 'in'});
      updateSearch();
      if (DDS.isLargeTablet()) {
        dispatch({
          type: Actions.CONTAINER_BOTTOM_BUTTON,
          state: {
            onPress: _onPressBottomButton,
          },
        });
      }
      ranAfterInteractions = false;
    });
  };

  useEffect(() => {
    if (!ranAfterInteractions) {
      ranAfterInteractions = true;
      runAfterInteractions();
    }

    navigation.addListener('focus', onFocus);
    return () => {
      ranAfterInteractions = false;
      pageIsLoaded = false;
      navigation.removeListener('focus', onFocus);
      eSendEvent(eScrollEvent, {name: 'Notebooks', type: 'back'});
    };
  }, []);

  useEffect(() => {
    if (navigation.isFocused()) {
      updateSearch();
    }
  }, [notebooks]);

  const updateSearch = () => {
    SearchService.update({
      placeholder: 'Type a keyword to search in notebooks',
      data: notebooks,
      type: 'notebooks',
      title: 'Notebooks',
    });
  };

  const _onPressBottomButton = () => AddNotebookEvent();

  return (
    <>
      <SimpleList
        listData={notebooks}
        type="notebooks"
        focused={() => navigation.isFocused()}
        loading={loading}
        placeholderData={{
          heading: 'Your notebooks',
          paragraph: 'You have not added any notebooks yet.',
          button: 'Add a notebook',
          action: _onPressBottomButton,
          loading: 'Loading your notebooks',
        }}
        headerProps={{
          heading: 'Notebooks',
        }}
        placeholder={<Placeholder type="notebooks" />}
      />

      {!notebooks || notebooks.length === 0 ? null : (
        <ContainerBottomButton
          title="Create a new notebook"
          onPress={_onPressBottomButton}
        />
      )}
    </>
  );
};

export default Folders;
