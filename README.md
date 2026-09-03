# @cekemail/widget

Email validation widget for CekEmail. Validates email addresses in real-time on your website.

## Installation

### NPM

```bash
npm install @cekemail/widget
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@cekemail/widget"></script>
```

## Usage

### CDN (Simple Embed)

Add this code to your website, just before the closing `</body>` tag:

```html
<script>
  CekEmail_APIKEY = 'wk_xxxxxxxxxxxxx';
</script>
<script src="https://cdn.jsdelivr.net/npm/@cekemail/widget"></script>
```

The widget will automatically:
- Detect all `<input type="email">` elements
- Validate emails when users leave the field (blur)
- Display visual indicators (✓ for valid, ✗ for invalid)

### NPM (ES Module)

```typescript
import { CekEmail } from '@cekemail/widget';

const widget = new CekEmail();

widget.init({
  apiKey: 'wk_xxxxxxxxxxxxx',
  debounce: 500,           // optional: delay before validation (ms)
  showIndicator: true,     // optional: show ✓/✗ icons
  validateOnBlur: true,    // optional: validate on blur
  validateOnChange: false, // optional: validate while typing
});
```

### CommonJS

```javascript
const { CekEmail } = require('@cekemail/widget');

const widget = new CekEmail();
widget.init({ apiKey: 'wk_xxxxxxxxxxxxx' });
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | `null` | Widget API key (required) |
| `apiUrl` | `string` | `https://cekemail.com/api/v1/widget/email-check` | API endpoint |
| `debounce` | `number` | `800` | Delay before validation (ms) |
| `showIndicator` | `boolean` | `true` | Show validation icons |
| `autoAttach` | `boolean` | `true` | Auto-attach to email inputs |
| `validateOnBlur` | `boolean` | `true` | Validate when field loses focus |
| `validateOnChange` | `boolean` | `false` | Validate while typing |
| `cssClass` | `object` | See below | Custom CSS class names |
| `locale` | `string` | `'en'` | Language for built-in messages (`en`, `id`) |
| `messages` | `object \| function` | `null` | Custom messages keyed by reason code, or a function (see [Localization](#localization)) |

### CSS Classes

```typescript
{
  valid: 'cekemail-valid',
  invalid: 'cekemail-invalid',
  checking: 'cekemail-checking',
  wrapper: 'cekemail-wrapper',
  indicator: 'cekemail-indicator',
}
```

## Localization

The widget ships with English and Indonesian messages. Pick one with `locale`, override any string with `messages`, or supply a function for full control. Messages are shown as the input's tooltip and in the `data-cekemail-message` attribute.

```html
<script>
  CekEmail_APIKEY = 'wk_xxxxxxxxxxxxx';
  CekEmail_LOCALE = 'id';
  CekEmail_MESSAGES = { mailbox_not_found: 'Alamat ini tidak ditemukan' };
</script>
<script src="https://cdn.jsdelivr.net/npm/@cekemail/widget"></script>
```

```typescript
widget.init({
  apiKey: 'wk_xxxxxxxxxxxxx',
  locale: 'en',
  messages: {
    invalid_format: 'Please enter a valid email address',
    disposable: 'Temporary email providers are not allowed',
  },
});

// Function form: return a string, or a falsy value to fall back to the defaults
widget.init({
  apiKey: 'wk_xxxxxxxxxxxxx',
  messages: (result, isValid) => (isValid ? null : `We could not verify ${result.input}`),
});
```

Messages are looked up by the API's `reason_code`. Keys you can override:

| Key | When it is shown |
|-----|------------------|
| `checking` | While a lookup is in progress |
| `invalid_format` | The address failed the local format check |
| `mailbox_exists` | The mailbox exists and accepts mail |
| `mailbox_not_found` | The mail server reported the mailbox does not exist |
| `mailbox_full` | The mailbox is over quota |
| `mailbox_not_allowed` | The mail server does not accept this mailbox name |
| `no_mx_records` | The domain has no mail server |
| `disposable` | The domain is a disposable email provider |
| `catch_all` | The domain accepts any address |
| `greylisted` | The mail server asked for a retry |
| `smtp_unreachable` | No mail server could be reached |
| `server_temporarily_unavailable` | The mail server returned a temporary failure |
| `sender_blocked` | The mail server refused the verification |
| `policy_rejected` | The mail server rejected the address for policy reasons |
| `unknown` | The verification could not be completed |
| `valid` / `invalid` | Generic fallbacks when no code matches |

## API

### `init(config?)`

Initialize the widget with optional configuration.

```typescript
widget.init({
  apiKey: 'wk_xxxxxxxxxxxxx',
  debounce: 500,
});
```

### `validate(input | email)`

Validate an input element or email string.

```typescript
// Validate input element
const input = document.querySelector('#email');
widget.validate(input);

// Validate email string
const result = await widget.validate('test@example.com');
console.log(result.is_valid);
```

### `validateEmailDirectly(email)`

Validate an email string and return the result.

```typescript
const result = await widget.validateEmailDirectly('test@example.com');
console.log(result);
// {
//   is_valid: true,
//   is_reachable: true,
//   is_disposable_email: false,
//   reason: 'Email is valid'
// }
```

### `attachToInput(input)`

Manually attach the widget to an input element.

```typescript
const input = document.querySelector('#my-email');
widget.attachToInput(input);
```

### `clearValidationState(input)`

Clear validation state from an input.

```typescript
widget.clearValidationState(input);
```

### `clearCache()`

Clear the validation result cache.

```typescript
widget.clearCache();
```

### `getCacheSize()`

Get the number of cached validation results.

```typescript
console.log(widget.getCacheSize());
```

## Events

### `cekemail:validated`

Fired when an email is validated.

```javascript
document.addEventListener('cekemail:validated', (event) => {
  const { input, result, isValid } = event.detail;

  console.log('Email:', input.value);
  console.log('Valid:', isValid);
  console.log('Result:', result);
});
```

## Disabling on Specific Inputs

Add `data-cekemail-disable` to prevent validation:

```html
<input type="email" data-cekemail-disable />
```

## CSS Styling

The widget adds classes to inputs based on validation state:

```css
/* Valid email */
input.cekemail-valid {
  border-color: #22c55e !important;
}

/* Invalid email */
input.cekemail-invalid {
  border-color: #ef4444 !important;
}

/* Checking email */
input.cekemail-checking {
  border-color: #3b82f6 !important;
}
```

Override with your own styles:

```css
input.cekemail-valid {
  border: 2px solid green;
  background-color: #f0fff0;
}

input.cekemail-invalid {
  border: 2px solid red;
  background-color: #fff0f0;
}
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import {
  CekEmail,
  CekEmailConfig,
  ValidationResult,
  ValidatedEventDetail,
} from '@cekemail/widget';

const config: Partial<CekEmailConfig> = {
  apiKey: 'wk_xxxxxxxxxxxxx',
  debounce: 500,
};

const widget = new CekEmail();
widget.init(config);

// Type-safe validation result
const result: ValidationResult = await widget.validateEmailDirectly('test@example.com');
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT
