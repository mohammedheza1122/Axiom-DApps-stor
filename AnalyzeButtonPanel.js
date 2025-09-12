/* eslint-disable react/prop-types */
import { Button } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { getHSEmbedToken, getHSUserId, hsApiEndpoint } from '../../lib/constants';
import { getUserQuery } from '../graphql/queries';

const helpDocUrl = 'https://coschedule.com/support'; // TODO: update with real URL when available

function AnalyzeButtonPanel({ onAnalyzeClick }) {
  const [numberOfPremiums, setNumberOfPremiums] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    let remainingPremium;

    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Basic ${getHSEmbedToken()}`,
      },
      body: JSON.stringify(getUserQuery(getHSUserId())),
    };

    fetch(`${hsApiEndpoint}/graphql`, options).then((response) => {
      if (mounted) {
        response
          .json()
          .then((data) => {
            remainingPremium = data?.data?.getUser?.accountSubscription?.currentUsage?.premiumHeadlinesRemaining ?? 0;
            setNumberOfPremiums(remainingPremium);
          })
          .catch((error) => {
            console.error(error);
            setHasError(true);
          });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="headline-studio-analyze-button-panel">
        {hasError && (
          <div className="analyze-button-panel-error">
            There was an error analyzing this headline, please try to analyze it again in a moment.
          </div>
        )}
        <button
          type="button"
          className="headline-studio-analyze-button"
          data-tooltip={`${numberOfPremiums === 0 ? 'No' : numberOfPremiums} Premium Headline${
            numberOfPremiums === 1 ? '' : 's'
          } Remaining`}
          onClick={onAnalyzeClick}
        >
          {numberOfPremiums > 0 && (
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 1024 1024">
              <path
                fill="#FFFFFF"
                d="M913.92 0c-232.96 0-465.92 0-698.88 0-33.28 0-66.56 0-99.84 0-12.8 0-20.48 5.12-28.16 10.24 0 0 0 0-2.56 2.56 0 0 0 0 0 0-5.12 7.68-10.24 15.36-10.24 28.16 0 273.92 0 550.4 0 824.32 0 38.4 0 79.36 0 117.76 0 30.72 33.28 48.64 61.44 35.84 125.44-71.68 253.44-143.36 378.88-215.040 125.44 71.68 253.44 143.36 378.88 215.040 25.6 15.36 61.44-5.12 61.44-35.84 0-273.92 0-550.4 0-824.32 0-38.4 0-79.36 0-117.76 0-23.040-17.92-40.96-40.96-40.96zM770.56 345.6c-35.84 35.84-71.68 74.24-107.52 110.080 7.68 51.2 15.36 99.84 23.040 151.040 2.56 17.92-12.8 33.28-30.72 23.040-46.080-23.040-92.16-46.080-138.24-69.12-46.080 23.040-92.16 46.080-138.24 69.12-17.92 7.68-33.28-5.12-30.72-23.040 7.68-51.2 15.36-99.84 23.040-151.040-35.84-35.84-71.68-74.24-107.52-110.080-10.24-10.24-7.68-33.28 10.24-35.84 51.2-7.68 102.4-17.92 153.6-25.6 23.040-46.080 48.64-92.16 71.68-138.24 5.12-7.68 10.24-10.24 17.92-10.24s12.8 2.56 17.92 10.24c23.040 46.080 48.64 92.16 71.68 138.24 51.2 7.68 102.4 17.92 153.6 25.6 15.36 2.56 20.48 25.6 10.24 35.84z"
              ></path>
            </svg>
          )}
          Analyze Headline
        </button>
        <div className="headline-studio-analyze-help-link">
          <Button href={helpDocUrl} variant="link" target="_blank" rel="noopener">
            Get Help
          </Button>
        </div>
      </div>
    </>
  );
}

export default AnalyzeButtonPanel;
