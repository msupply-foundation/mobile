/* eslint-disable max-len */
import * as React from 'react';
import PropTypes from 'prop-types';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  RadialGradient,
  G,
  Mask,
  Use,
  Ellipse,
} from 'react-native-svg';

export const BreachManHappy = ({ width = 100, height = 80 }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 300 300"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <Defs>
      <LinearGradient x1="30.668%" y1="40.487%" x2="65.881%" y2="53.381%" id="prefix__c">
        <Stop stopColor="#E1E7EA" offset="0%" />
        <Stop stopColor="#D0D6DC" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="31.432%" y1="42.431%" x2="72.312%" y2="56.544%" id="prefix__e">
        <Stop stopColor="#E1E7EA" offset="0%" />
        <Stop stopColor="#D0D6DC" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="50%" y1="45.853%" x2="79.143%" y2="65.068%" id="prefix__f">
        <Stop stopColor="#FBFBFB" offset="0%" />
        <Stop stopColor="#D9DFE3" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="24.921%" y1="3.123%" x2="49.927%" y2="89.467%" id="prefix__g">
        <Stop stopColor="#ECECEC" offset="0%" />
        <Stop stopColor="#E1E7EA" offset="71.754%" />
        <Stop stopColor="#BCC3CA" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="29.489%" y1="50%" x2="100%" y2="50%" id="prefix__h">
        <Stop stopColor="#BAC6D2" offset="0%" />
        <Stop stopColor="#7F8F9F" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="50%" y1="50%" x2="76.359%" y2="71.065%" id="prefix__i">
        <Stop stopColor="#E1E7EA" offset="0%" />
        <Stop stopColor="#D0D6DC" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="73.574%" y1="89.772%" x2="23.647%" y2="5.523%" id="prefix__j">
        <Stop stopColor="#DAE2E6" offset="0%" />
        <Stop stopColor="#E3EBEF" offset="58%" />
        <Stop stopColor="#EDF6F9" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="29.814%" y1="47.388%" x2="111.048%" y2="50%" id="prefix__k">
        <Stop stopColor="#C4CDD1" offset="0%" />
        <Stop stopColor="#C6CFD3" stopOpacity={0} offset="100%" />
      </LinearGradient>
      <LinearGradient x1="50%" y1="100%" x2="50%" y2=".75%" id="prefix__l">
        <Stop stopColor="#A1A7B8" offset="0%" />
        <Stop stopColor="#7B8195" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="13.317%" y1="4.088%" x2="78.433%" y2="111.588%" id="prefix__m">
        <Stop stopColor="#E5E9F0" offset="0%" />
        <Stop stopColor="#D2DAE8" offset="100%" />
      </LinearGradient>
      <LinearGradient x1="44.016%" y1="27.419%" x2="81.805%" y2="64.235%" id="prefix__o">
        <Stop stopColor="#67D666" stopOpacity={0} offset="0%" />
        <Stop stopColor="#67D666" stopOpacity={0.2} offset="100%" />
      </LinearGradient>
      <Path
        d="M298.752 85.88C305.987 71.565 285.308 0 141.922 0 38.428 0-9.073 58.578 1.429 88.265"
        id="prefix__a"
      />
      <Path
        d="M31.599.932a3.086 3.086 0 014.42 0 3.183 3.183 0 010 4.444L15.907 25.905a3.087 3.087 0 01-4.421 0L.904 15.105a3.183 3.183 0 010-4.443 3.086 3.086 0 014.42 0l8.371 8.544L31.6.932z"
        id="prefix__n"
      />
      <RadialGradient
        cx="43.37%"
        cy="34.68%"
        fx="43.37%"
        fy="34.68%"
        r="58.142%"
        gradientTransform="matrix(0 -1 .90444 0 .12 .78)"
        id="prefix__b"
      >
        <Stop stopColor="#EBEDF0" stopOpacity={0.24} offset="0%" />
        <Stop stopColor="#EBEDF0" stopOpacity={0.846} offset="53.678%" />
        <Stop stopColor="#E0E4E7" stopOpacity={0} offset="100%" />
      </RadialGradient>
    </Defs>
    <G fill="none" fillRule="evenodd">
      <Path d="M0 0h300v300H0z" />
      <G transform="translate(0 20.913)">
        <G transform="translate(0 169.546)">
          <Mask id="prefix__d" fill="#fff">
            <Use xlinkHref="#prefix__a" />
          </Mask>
          <Use fill="url(#prefix__b)" fillRule="nonzero" xlinkHref="#prefix__a" />
          <Ellipse
            fill="url(#prefix__c)"
            fillRule="nonzero"
            opacity={0.672}
            mask="url(#prefix__d)"
            cx={119.809}
            cy={40.133}
            rx={7.886}
            ry={4.378}
          />
          <Ellipse
            fill="url(#prefix__e)"
            fillRule="nonzero"
            opacity={0.73}
            mask="url(#prefix__d)"
            cx={200.292}
            cy={33.45}
            rx={12.442}
            ry={6.83}
          />
          <Ellipse
            fill="url(#prefix__f)"
            fillRule="nonzero"
            opacity={0.73}
            mask="url(#prefix__d)"
            cx={58.703}
            cy={15.236}
            rx={12.442}
            ry={6.83}
          />
        </G>
        <G opacity={0.321} transform="translate(215.346 40.647)" fillRule="nonzero">
          <Ellipse fill="url(#prefix__g)" cx={17.343} cy={9.529} rx={8.411} ry={8.406} />
          <Path
            d="M25.734 11.656c-2.29.715-5.472 1.135-8.889 1.135-3.417 0-6.6-.42-8.888-1.134-.967-.302-1.716-.64-2.186-.966.083-.057.177-.117.285-.179.813-.469 2.09-.909 3.678-1.245l-.873-4.113c-4.603.976-7.576 2.69-7.576 5.537 0 4.141 6.929 6.305 15.56 6.304 8.632 0 15.561-2.165 15.561-6.306 0-2.904-2.783-4.185-8.105-5.292l-.856 4.115c1.81.377 3.208.783 4.12 1.204.064.029.125.058.182.086-.472.29-1.157.586-2.013.854z"
            fill="url(#prefix__h)"
            transform="rotate(20 16.846 11.075)"
          />
          <Path
            d="M25.771 9.529c0-4.643-3.766-8.406-8.411-8.406S9.805 4.09 9.204 7.438c3.224 2.017 5.58 3.242 7.068 3.676.712.207 1.418.476 2.137.715.804.267 1.622.502 2.451.706.567.14 1.344.356 2.07.49.957.178 1.814.258 1.881.258.119 0 .249-.529.516-1.145.179-.41.327-1.28.444-2.61z"
            fill="url(#prefix__i)"
          />
        </G>
        <Ellipse
          fill="url(#prefix__j)"
          opacity={0.418}
          cx={47.885}
          cy={99.767}
          rx={9.808}
          ry={9.804}
        />
        <Ellipse
          fill="url(#prefix__k)"
          fillRule="nonzero"
          opacity={0.426}
          cx={154.038}
          cy={183.387}
          rx={29.423}
          ry={8.074}
        />
        <Path
          d="M29.162 38.061c-.537 1.555-.805 2.879-.805 3.972-.538 9.517-.14 22.033 1.191 37.55h3.102l4.578-35.02 6.206 35.02h3.052c.268-14.988 0-27.504-.806-37.55a7.647 7.647 0 00-.703-3.178l-15.815-.794z"
          fill="url(#prefix__l)"
          fillRule="nonzero"
          transform="translate(104.567 99.19)"
        />
        <Path
          d="M131 119.182l-6.149 1.454-2.098-.557-13.33-1.935h-3.22l-.012-4.26.794 1.636 1.429.449c.513-1.037.85-1.467 1.009-1.29.158.177.272.63.341 1.358l1.191.616h14.192l3.353-1.97 2.5 4.5zM151 119.182l6.333 1.454 2.098-.557 13.33-1.935 3.648-1.858 1.239-2.475-.464-.065-1.985 1.774-1.429.449c-.513-1.037-.85-1.467-1.009-1.29-.158.177-.272.63-.341 1.358l-1.191.616h-14.192l-3.537-1.97-2.5 4.5z"
          fill="#FDE7E6"
          fillRule="nonzero"
        />
        <Path
          d="M23.51 15.755l1.951 4.75h4.771L28.125 40.23c4.011.674 7.077 1.093 9.198 1.256 2.121.163 4.69-.255 7.708-1.256V21.007l4.237-.502.78-4.75c-2.638-1.85-4.31-2.93-5.017-3.238-.707-.307-2.255-.635-4.644-.983h-5.669c-3.002.116-4.787.444-5.354.983-.568.54-2.52 1.62-5.854 3.238z"
          fill="url(#prefix__m)"
          fillRule="nonzero"
          transform="matrix(-1 0 0 1 178.125 99.19)"
        />
        <Path
          d="M139.471 107.264h3.55v4.71l-.144.227c-1.324 2.076-1.986 2.898-1.986 2.468 0-.446-.473-1.344-1.42-2.696v-4.71z"
          fill="#FECECD"
          fillRule="nonzero"
        />
        <Path
          d="M141.227 111.123c1.495.072 3.588-2.646 3.588-5.293 0-2.647-.781-5.294-3.588-5.294s-3.886 2.37-3.886 5.294c0 2.923 2.391 5.22 3.886 5.293z"
          fill="#FFE9E9"
          fillRule="nonzero"
        />
        <Path
          d="M136.976 106.173c.299-.998.299-3.2.897-3.271.598-.072 1.794.345 2.99-.464.597-.444.896-.5.896-.723 2.99.532 1.202 2.135 2.69 3.9.104.124.303.124.599 0 0-2.898-.1-4.477-.3-4.735-.298-.388-1.494-1.95-2.092-.836 0-.557-1.196-1.132-2.392-.705-1.195.426-2.989 1.262-3.288 2.376-.299 1.115-.598 3.344 0 4.458z"
          fill="#513450"
        />
        <Path
          d="M134.353 178.773l-1.208 2.056a3.284 3.284 0 00-.453 1.664c0 .494.4.894.894.894h2.568c.637 0 1.154-.517 1.154-1.154 0-.762-.14-1.518-.414-2.23l-.472-1.23h-2.069zM150.647 178.773l1.208 2.056c.296.504.453 1.079.453 1.664 0 .494-.4.894-.894.894h-2.568a1.153 1.153 0 01-1.154-1.154c0-.762.14-1.518.414-2.23l.472-1.23h2.069z"
          fill="#677285"
          fillRule="nonzero"
        />
        <Path
          d="M106.204 5.521h3.461v175.89a1.73 1.73 0 11-3.461 0V5.52z"
          fill="#D8D8D8"
          fillRule="nonzero"
        />
        <Path
          d="M106.154 5.625l18.642 4.432a36.666 36.666 0 0027.773-4.491 32.566 32.566 0 0127.409-3.21l9.83 3.269-5.77 43.15-3.298-1.345a28.368 28.368 0 00-28.17 3.907 27.947 27.947 0 01-28.09 3.71l-18.326-7.755V5.625z"
          fill="#8ED28E"
          fillRule="nonzero"
        />
        <G transform="rotate(-3 377.293 -2393.24)">
          <Mask id="prefix__p" fill="#fff">
            <Use xlinkHref="#prefix__n" />
          </Mask>
          <Use fill="#FFF" fillRule="nonzero" xlinkHref="#prefix__n" />
          <Path
            fill="url(#prefix__o)"
            fillRule="nonzero"
            opacity={0.8}
            mask="url(#prefix__p)"
            d="M13.846 19.03l-7.788 7.498-7.789-5.767L10.385 9.804z"
          />
        </G>
        <Path
          d="M105.462 114.833c1.153-.577 1.73-.769 1.73-.577v3.46l-1.154.577-.576-3.46z"
          fill="#FFE9E9"
          fillRule="nonzero"
        />
      </G>
    </G>
  </Svg>
);

BreachManHappy.defaultProps = {
  width: undefined,
  height: undefined,
};

BreachManHappy.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};
