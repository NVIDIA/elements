import { define } from '@nvidia-elements/core/internal';
import { Avatar, AvatarGroup } from '@nvidia-elements/core/avatar';

define(Avatar);
define(AvatarGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-avatar': Avatar;
    'nve-avatar-group': AvatarGroup;
  }
}
