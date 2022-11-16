import { ethers } from 'ethers';
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import Client from 'mailgun.js/client';

import { DEX } from 'src/pairs';
import { ExchangePrice, ProfitComputationResult } from './PriceService';

export class MailService {
  protected mailgun?: Client;
  constructor() {
    if (process.env.MAILGUN_ACTIVE == 'true') {
      const mailgun = new Mailgun(formData);
      this.mailgun = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY!,
      });
    }
  }
  sendGenericEmail({
    pair,
    exchangeBuy,
    exchangeSell,
    priceDifDir,
  }: {
    pair: ExchangePrice;
    exchangeBuy: DEX;
    exchangeSell: DEX;
    priceDifDir: number;
  }) {
    if (!process.env.MAILGUN_ACTIVE) {
      return;
    }
    try {
      this.mailgun?.messages.create(process.env.MAILGUN_DOMAIN!, {
        from: 'PRINT BNB <me@samples.mailgun.org>',
        to: ['limol.lionel@gmail.com', 'lorcann@live.fr'],
        subject: 'Hello',
        text: `BUY ${pair.baseToken.symbol} on ${exchangeBuy.name} and SELL ${
          pair.quoteToken.symbol
        } on ${exchangeSell.name} || profit: ${
          priceDifDir *
          parseFloat(ethers.utils.formatEther(pair.baseTokenAmount))
        } ${pair.quoteToken.symbol} ${
          pair.quoteToken.symbol
        } || priceDiff: ${priceDifDir} || Price gotten for baseToken amount: ${
          pair.baseTokenAmount
        }`,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
